import { describe, it } from 'mocha'
import { assert } from 'chai'
import { configurations } from '../../../lib/configuration'
import * as DefaultConfiguration from '../../../../src/configuration/DefaultConfiguration'
import * as DefaultBehaviors from '../../../../src/configuration/DefaultBehaviors'

const defaultBehaviors = DefaultBehaviors.overrideDefaultBehaviors()

configurations.forEach((configuration) => {
  const currentConfiguration = DefaultConfiguration.overrideDefaultConfiguration({ recognitionParams: configuration })

  describe(`Check behaviors for API ${currentConfiguration.recognitionParams.apiVersion} ${currentConfiguration.recognitionParams.type} ${currentConfiguration.recognitionParams.protocol}`, () => {
    const behavior = defaultBehaviors.getBehaviorFromConfiguration(defaultBehaviors, currentConfiguration)

    it('grabber', () => {
      assert.isDefined(behavior.grabber, 'grabber should be defined')
    })

    it('stroker', () => {
      assert.isDefined(behavior.stroker, 'stroker should be defined')
      const strokerType = currentConfiguration.recognitionParams.protocol === 'WEBSOCKET' ? 'svg' : 'canvas'
      assert.strictEqual(behavior.stroker.getInfo().type, strokerType)
    })

    it('renderer', () => {
      assert.isDefined(behavior.renderer, 'renderer should be defined')
      const rendererType = currentConfiguration.recognitionParams.protocol === 'WEBSOCKET' ? 'svg' : 'canvas'
      assert.strictEqual(behavior.renderer.getInfo().type, rendererType)
    })

    it('recognizer', () => {
      assert.isDefined(behavior.recognizer, 'recognizer should be defined')
      assert.include(behavior.recognizer.getInfo().types, currentConfiguration.recognitionParams.type)
      assert.strictEqual(behavior.recognizer.getInfo().protocol, currentConfiguration.recognitionParams.protocol)
      // assert.strictEqual(defaultBehaviors.optimizedParameters.exportContentTriggerOn, trigger, `${trigger} should be the default value for ${behavior} exportContentTriggerOn`);
    })

    it('events', () => {
      assert.isDefined(behavior.events, 'events should be defined')
    })
  })
})
