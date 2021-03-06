import Model, {attr, hasMany} from '@ember-data/model';
import ValidationEngine from 'ghost-admin/mixins/validation-engine';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Model.extend(ValidationEngine, {
    validationType: 'member',

    name: attr('string'),
    email: attr('string'),
    note: attr('string'),
    createdAtUTC: attr('moment-utc'),
    stripe: attr('member-subscription'),
    subscribed: attr('boolean', {defaultValue: true}),
    labels: hasMany('label', {embedded: 'always', async: false}),
    comped: attr('boolean', {defaultValue: false}),
    geolocation: attr('json-string'),

    ghostPaths: service(),
    ajax: service(),

    // remove client-generated labels, which have `id: null`.
    // Ember Data won't recognize/update them automatically
    // when returned from the server with ids.
    // https://github.com/emberjs/data/issues/1829
    updateLabels() {
        let labels = this.labels;
        let oldLabels = labels.filterBy('id', null);

        labels.removeObjects(oldLabels);
        oldLabels.invoke('deleteRecord');
    },

    fetchSigninUrl: task(function* () {
        let url = this.get('ghostPaths.url').api('members', this.get('id'), 'signin_urls');

        let response = yield this.ajax.request(url);

        return response.member_signin_urls[0];
    }).drop()
});
