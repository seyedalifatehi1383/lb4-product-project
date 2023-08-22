import {
  Count,
  CountSchema,
  Entity,
  Filter,
  model,
  property,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {
  NewUser,
  Chat,
} from '../models';
import {NewUserRepository} from '../repositories';

import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {test} from 'node:test';
import _ from 'lodash';

@model()
export class showMessageResponse extends Entity {
  @property({
    type: 'number'
  })
  id : number

  @property({
    type : 'string',
    required :true
  })
  name : string;

  @property({
    type : 'string',
    // required :true
  })
  title? : string;

  @property({
    type : 'string',
    required :true
  })
  text : string;

  @property({
    type : 'string',
    // require :true
  })
  group? : string;
}

@authenticate('jwt')
export class NewUserChatController {
  constructor(
    @repository(NewUserRepository) protected newUserRepository: NewUserRepository,
  ) { }

  @get('/new-users/{id}/chats', {
    responses: {
      '200': {
        description: 'Array of NewUser has many Chat',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Chat)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Chat>,
  ): Promise<Chat[]> {
    return this.newUserRepository.chats(id).find(filter);
  }

  @post('/new-users/chats', {
    responses: {
      '200': {
        description: 'NewUser model instance',
        content: {'application/json': {
          schema: getModelSchemaRef(Chat , {
            partial : true,
            exclude : ['newUserId']
          })
          }
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Chat, {
            title: 'NewChatInNewUser',
            exclude: ['id' , 'newUserId' ,'name'],
          }),
        },
      },
    })
    chat: Omit<Chat, 'id'>,
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    ): Promise<any> {
    chat.newUserId = currentUserProfile[securityId]
    // let showResponse: showMessageResponse
    chat.name = currentUserProfile.name!
    const response = await this.newUserRepository.chats(currentUserProfile[securityId]).create(chat);
    return _.omit(response, 'newUserId')
  }

  @patch('/new-users/{id}/chats', {
    responses: {
      '200': {
        description: 'NewUser.Chat PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Chat, {partial: true}),
        },
      },
    })
    chat: Partial<Chat>,
    @param.query.object('where', getWhereSchemaFor(Chat)) where?: Where<Chat>,
  ): Promise<Count> {
    return this.newUserRepository.chats(id).patch(chat, where);
  }

  @del('/new-users/{id}/chats', {
    responses: {
      '200': {
        description: 'NewUser.Chat DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Chat)) where?: Where<Chat>,
  ): Promise<Count> {
    return this.newUserRepository.chats(id).delete(where);
  }
}
