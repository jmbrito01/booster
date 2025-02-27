/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockReq } from 'sinon-express-mock'
import { SinonStub, stub, replace, restore } from 'sinon'
import { rawGraphQLRequestToEnvelope } from '../../src/library/graphql-adapter'
import { expect } from '../expect'
import { UUID } from '@boostercloud/framework-types'
import { random } from 'faker'
import { Request } from 'express'

describe('Local provider graphql-adapter', () => {
  describe('rawGraphQLRequestToEnvelope', () => {
    let mockUuid: string
    let mockBody: any
    let mockRequest: Request
    let mockUserToken: string

    let debugStub: SinonStub
    let generateStub: SinonStub

    let logger: any

    beforeEach(() => {
      mockUuid = random.uuid()
      mockUserToken = random.uuid()
      mockBody = {
        query: '',
        variables: {},
      }
      mockRequest = mockReq()
      mockRequest.body = mockBody
      mockRequest.headers = {
        authorization: mockUserToken,
      }

      debugStub = stub()
      generateStub = stub().returns(mockUuid)

      logger = {
        debug: debugStub,
      }

      replace(UUID, 'generate', generateStub)
    })

    afterEach(() => {
      restore()
    })

    it('should call logger.debug', async () => {
      await rawGraphQLRequestToEnvelope(mockRequest, logger)

      expect(debugStub).to.have.been.calledOnceWith(
        'Received GraphQL request: \n- Headers: ',
        mockRequest.headers,
        '\n- Body: ',
        mockRequest.body
      )
    })

    it('should generate expected envelop', async () => {
      const result = await rawGraphQLRequestToEnvelope(mockRequest, logger)

      expect(result).to.be.deep.equal({
        requestID: mockUuid,
        eventType: 'MESSAGE',
        connectionID: undefined,
        token: mockUserToken,
        value: mockBody,
      })
    })
  })
})
