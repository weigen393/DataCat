var expect = require('chai').expect;
var createMessage = require('./add.js');
// const { createMessage } = require('../worker/util/alertGenerator');

describe('createMessage', function () {
    it('createMessage', function () {
        const data = {
            title: '123',
            description: '321',
            layer: 'system',
            host: ['ip-172-31-2-160'],
            measurement: ['cpu'],
            field: ['usage_system'],
            status: 'on',
            // _id: new ObjectId('633d45c16205bab02dc31f07'),
            threshold: '2',
            thresholdType: 'above',
        };
        const text = 'ok';
        expect(createMessage(data, text)).to.be.equal('Notice,ip-172-31-2-160 cpu usage_system is ok right now');
    });
    it('createMessage', function () {
        const data = {
            title: '123',
            description: '321',
            layer: 'system',
            host: ['ip-172-31-2-160'],
            measurement: ['mem'],
            field: ['usage_percent'],
            status: 'on',
            // _id: new ObjectId('633d45c16205bab02dc31f07'),
            threshold: '2',
            thresholdType: 'above',
        };
        const text = 'ok';
        expect(createMessage(data, text)).to.be.equal('Notice,ip-172-31-2-160 mem usage_percent is ok right now');
    });
});
