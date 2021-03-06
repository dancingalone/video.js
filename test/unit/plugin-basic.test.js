/* eslint-env qunit */
import sinon from 'sinon';
import Plugin from '../../src/js/plugin';
import TestHelpers from './test-helpers';

QUnit.module('Plugin: basic', {

  beforeEach() {
    this.basic = sinon.spy();
    this.player = TestHelpers.makePlayer();

    Plugin.registerPlugin('basic', this.basic);
  },

  afterEach() {
    this.player.dispose();

    Object.keys(Plugin.getPlugins()).forEach(key => {
      if (key !== Plugin.BASE_PLUGIN_NAME) {
        Plugin.deregisterPlugin(key);
      }
    });
  }
});

QUnit.test('pre-setup interface', function(assert) {
  assert.strictEqual(typeof this.player.basic, 'function', 'basic plugins are a function on a player');
  assert.ok(this.player.hasPlugin('basic'), 'player has the plugin available');
  assert.notStrictEqual(this.player.basic, this.basic, 'basic plugins are wrapped');
  assert.strictEqual(this.player.basic.dispose, undefined, 'unlike advanced plugins, basic plugins do not have a dispose method');
  assert.notOk(this.player.usingPlugin('basic'), 'the player is not using the plugin');
});

QUnit.test('setup', function(assert) {
  this.player.basic({foo: 'bar'}, 123);
  assert.strictEqual(this.basic.callCount, 1, 'the plugin was called once');
  assert.strictEqual(this.basic.firstCall.thisValue, this.player, 'the plugin `this` value was the player');
  assert.deepEqual(this.basic.firstCall.args, [{foo: 'bar'}, 123], 'the plugin had the correct arguments');
  assert.ok(this.player.usingPlugin('basic'), 'the player now recognizes that the plugin was set up');
  assert.ok(this.player.hasPlugin('basic'), 'player has the plugin available');
});

QUnit.test('"pluginsetup" event', function(assert) {
  const setupSpy = sinon.spy();

  this.player.on('pluginsetup', setupSpy);

  const instance = this.player.basic();
  const event = setupSpy.firstCall.args[0];
  const hash = setupSpy.firstCall.args[1];

  assert.strictEqual(setupSpy.callCount, 1, 'the "pluginsetup" event was triggered');
  assert.strictEqual(event.type, 'pluginsetup', 'the event has the correct type');

  assert.deepEqual(hash, {
    name: 'basic',
    instance,
    plugin: this.basic
  }, 'the event hash object is correct');
});
