var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
const shallowEqual = require('fbjs/lib/shallowEqual');
export class ObservableQueryRecycler {
    constructor() {
        this.observableQueries = [];
    }
    recycle(observableQuery) {
        observableQuery.setOptions({
            fetchPolicy: 'standby',
            pollInterval: 0,
            fetchResults: false,
        });
        this.observableQueries.push({
            observableQuery,
            subscription: observableQuery.subscribe({}),
        });
    }
    reuse(options) {
        if (this.observableQueries.length <= 0) {
            return null;
        }
        const item = this.observableQueries.pop();
        if (!item) {
            return null;
        }
        const { observableQuery, subscription } = item;
        subscription.unsubscribe();
        const { ssr, client } = options, modifiableOpts = __rest(options, ["ssr", "client"]);
        if (!shallowEqual(modifiableOpts.variables || {}, observableQuery.variables))
            return null;
        observableQuery.setOptions(Object.assign({}, modifiableOpts, { pollInterval: options.pollInterval, fetchPolicy: options.fetchPolicy }));
        return observableQuery;
    }
}
