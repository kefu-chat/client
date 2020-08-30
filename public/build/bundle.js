
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function localStorageStore({ storageKey, initialValue = "" }) {
      const init = localStorage.getItem(storageKey) || initialValue;

      const { subscribe, update, set } = writable(init);

      subscribe((state) => {
        if (state) localStorage.setItem(storageKey, state);
      });

      return {
        subscribe,
        update,
        set,
      };
    }

    const nav = localStorageStore({
      storageKey: "chat_nav",
      initialValue: "messages",
    });

    const chatTopic = localStorageStore({
      storageKey: "chat_topic",
      initialValue: "gundb",
    });

    const user = localStorageStore({ storageKey: "chat_user" });

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var gun = createCommonjsModule(function (module) {
    (function(){

      /* UNBUILD */
      var root;
      if(typeof window !== "undefined"){ root = window; }
      if(typeof commonjsGlobal !== "undefined"){ root = commonjsGlobal; }
      root = root || {};
      var console = root.console || {log: function(){}};
      function USE(arg, req){
        return req? commonjsRequire() : arg.slice? USE[R(arg)] : function(mod, path){
          arg(mod = {exports: {}});
          USE[R(path)] = mod.exports;
        }
        function R(p){
          return p.split('/').slice(-1).toString().replace('.js','');
        }
      }
      { var common = module; }
    USE(function(module){
    		// Generic javascript utilities.
    		var Type = {};
    		//Type.fns = Type.fn = {is: function(fn){ return (!!fn && fn instanceof Function) }}
    		Type.fn = {is: function(fn){ return (!!fn && 'function' == typeof fn) }};
    		Type.bi = {is: function(b){ return (b instanceof Boolean || typeof b == 'boolean') }};
    		Type.num = {is: function(n){ return !list_is(n) && ((n - parseFloat(n) + 1) >= 0 || Infinity === n || -Infinity === n) }};
    		Type.text = {is: function(t){ return (typeof t == 'string') }};
    		Type.text.ify = function(t){
    			if(Type.text.is(t)){ return t }
    			if(typeof JSON !== "undefined"){ return JSON.stringify(t) }
    			return (t && t.toString)? t.toString() : t;
    		};
    		Type.text.random = function(l, c){
    			var s = '';
    			l = l || 24; // you are not going to make a 0 length random number, so no need to check type
    			c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
    			while(l > 0){ s += c.charAt(Math.floor(Math.random() * c.length)); l--; }
    			return s;
    		};
    		Type.text.match = function(t, o){ var tmp, u;
    			if('string' !== typeof t){ return false }
    			if('string' == typeof o){ o = {'=': o}; }
    			o = o || {};
    			tmp = (o['='] || o['*'] || o['>'] || o['<']);
    			if(t === tmp){ return true }
    			if(u !== o['=']){ return false }
    			tmp = (o['*'] || o['>'] || o['<']);
    			if(t.slice(0, (tmp||'').length) === tmp){ return true }
    			if(u !== o['*']){ return false }
    			if(u !== o['>'] && u !== o['<']){
    				return (t >= o['>'] && t <= o['<'])? true : false;
    			}
    			if(u !== o['>'] && t >= o['>']){ return true }
    			if(u !== o['<'] && t <= o['<']){ return true }
    			return false;
    		};
    		Type.list = {is: function(l){ return (l instanceof Array) }};
    		Type.list.slit = Array.prototype.slice;
    		Type.list.sort = function(k){ // creates a new sort function based off some key
    			return function(A,B){
    				if(!A || !B){ return 0 } A = A[k]; B = B[k];
    				if(A < B){ return -1 }else if(A > B){ return 1 }
    				else { return 0 }
    			}
    		};
    		Type.list.map = function(l, c, _){ return obj_map(l, c, _) };
    		Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
    		Type.obj = {is: function(o){ return o? (o instanceof Object && o.constructor === Object) || Object.prototype.toString.call(o).match(/^\[object (\w+)\]$/)[1] === 'Object' : false }};
    		Type.obj.put = function(o, k, v){ return (o||{})[k] = v, o };
    		Type.obj.has = function(o, k){ return o && Object.prototype.hasOwnProperty.call(o, k) };
    		Type.obj.del = function(o, k){
    			if(!o){ return }
    			o[k] = null;
    			delete o[k];
    			return o;
    		};
    		Type.obj.as = function(o, k, v, u){ return o[k] = o[k] || (u === v? {} : v) };
    		Type.obj.ify = function(o){
    			if(obj_is(o)){ return o }
    			try{o = JSON.parse(o);
    			}catch(e){o={};}			return o;
    		}
    		;(function(){ var u;
    			function map(v,k){
    				if(obj_has(this,k) && u !== this[k]){ return }
    				this[k] = v;
    			}
    			Type.obj.to = function(from, to){
    				to = to || {};
    				obj_map(from, map, to);
    				return to;
    			};
    		}());
    		Type.obj.copy = function(o){ // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
    			return !o? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
    		}
    		;(function(){
    			function empty(v,i){ var n = this.n;
    				if(n && (i === n || (obj_is(n) && obj_has(n, i)))){ return }
    				if(i){ return true }
    			}
    			Type.obj.empty = function(o, n){
    				if(!o){ return true }
    				return obj_map(o,empty,{n:n})? false : true;
    			};
    		}());
    (function(){
    			function t(k,v){
    				if(2 === arguments.length){
    					t.r = t.r || {};
    					t.r[k] = v;
    					return;
    				} t.r = t.r || [];
    				t.r.push(k);
    			}			var keys = Object.keys, map;
    			Object.keys = Object.keys || function(o){ return map(o, function(v,k,t){t(k);}) };
    			Type.obj.map = map = function(l, c, _){
    				var u, i = 0, x, r, ll, lle, f = fn_is(c);
    				t.r = null;
    				if(keys && obj_is(l)){
    					ll = keys(l); lle = true;
    				}
    				if(list_is(l) || ll){
    					x = (ll || l).length;
    					for(;i < x; i++){
    						var ii = (i + Type.list.index);
    						if(f){
    							r = lle? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
    							if(r !== u){ return r }
    						} else {
    							//if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
    							if(c === l[lle? ll[i] : i]){ return ll? ll[i] : ii } // use this for now
    						}
    					}
    				} else {
    					for(i in l){
    						if(f){
    							if(obj_has(l,i)){
    								r = _? c.call(_, l[i], i, t) : c(l[i], i, t);
    								if(r !== u){ return r }
    							}
    						} else {
    							//if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
    							if(c === l[i]){ return i } // use this for now
    						}
    					}
    				}
    				return f? t.r : Type.list.index? 0 : -1;
    			};
    		}());
    		Type.time = {};
    		Type.time.is = function(t){ return t? t instanceof Date : (+new Date().getTime()) };

    		var fn_is = Type.fn.is;
    		var list_is = Type.list.is;
    		var obj = Type.obj, obj_is = obj.is, obj_has = obj.has, obj_map = obj.map;
    		module.exports = Type;
    	})(USE, './type');
    USE(function(module){
    		// On event emitter generic javascript utility.
    		module.exports = function onto(tag, arg, as){
    			if(!tag){ return {to: onto} }
    			var u, tag = (this.tag || (this.tag = {}))[tag] ||
    			(this.tag[tag] = {tag: tag, to: onto._ = {
    				next: function(arg){ var tmp;
    					if((tmp = this.to)){
    						tmp.next(arg);
    				}}
    			}});
    			if(arg instanceof Function){
    				var be = {
    					off: onto.off ||
    					(onto.off = function(){
    						if(this.next === onto._.next){ return !0 }
    						if(this === this.the.last){
    							this.the.last = this.back;
    						}
    						this.to.back = this.back;
    						this.next = onto._.next;
    						this.back.to = this.to;
    						if(this.the.last === this.the){
    							delete this.on.tag[this.the.tag];
    						}
    					}),
    					to: onto._,
    					next: arg,
    					the: tag,
    					on: this,
    					as: as,
    				};
    				(be.back = tag.last || tag).to = be;
    				return tag.last = be;
    			}
    			if((tag = tag.to) && u !== arg){ tag.next(arg); }
    			return tag;
    		};
    	})(USE, './onto');
    USE(function(module){
    		/* Based on the Hypothetical Amnesia Machine thought experiment */
    		function HAM(machineState, incomingState, currentState, incomingValue, currentValue){
    			if(machineState < incomingState){
    				return {defer: true}; // the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
    			}
    			if(incomingState < currentState){
    				return {historical: true}; // the incoming value is within the boundary of the machine's state, but not within the range.

    			}
    			if(currentState < incomingState){
    				return {converge: true, incoming: true}; // the incoming value is within both the boundary and the range of the machine's state.

    			}
    			if(incomingState === currentState){
    				incomingValue = Lexical(incomingValue) || "";
    				currentValue = Lexical(currentValue) || "";
    				if(incomingValue === currentValue){ // Note: while these are practically the same, the deltas could be technically different
    					return {state: true};
    				}
    				/*
    					The following is a naive implementation, but will always work.
    					Never change it unless you have specific needs that absolutely require it.
    					If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
    					As a result, it is highly discouraged to modify despite the fact that it is naive,
    					because convergence (data integrity) is generally more important.
    					Any difference in this algorithm must be given a new and different name.
    				*/
    				if(incomingValue < currentValue){ // Lexical only works on simple value types!
    					return {converge: true, current: true};
    				}
    				if(currentValue < incomingValue){ // Lexical only works on simple value types!
    					return {converge: true, incoming: true};
    				}
    			}
    			return {err: "Invalid CRDT Data: "+ incomingValue +" to "+ currentValue +" at "+ incomingState +" to "+ currentState +"!"};
    		}
    		if(typeof JSON === 'undefined'){
    			throw new Error(
    				'JSON is not included in this browser. Please load it first: ' +
    				'ajax.cdnjs.com/ajax/libs/json2/20110223/json2.js'
    			);
    		}
    		var Lexical = JSON.stringify;
    		module.exports = HAM;
    	})(USE, './HAM');
    USE(function(module){
    		var Type = USE('./type');
    		var Val = {};
    		Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
    			if(v === u){ return false }
    			if(v === null){ return true } // "deletes", nulling out keys.
    			if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
    			if(text_is(v) // by "text" we mean strings.
    			|| bi_is(v) // by "binary" we mean boolean.
    			|| num_is(v)){ // by "number" we mean integers or decimals.
    				return true; // simple values are valid.
    			}
    			return Val.link.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
    		};
    		Val.link = Val.rel = {_: '#'};
    (function(){
    			Val.link.is = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
    				if(v && v[rel_] && !v._ && obj_is(v)){ // must be an object.
    					var o = {};
    					obj_map(v, map, o);
    					if(o.id){ // a valid id was found.
    						return o.id; // yay! Return it.
    					}
    				}
    				return false; // the value was not a valid soul relation.
    			};
    			function map(s, k){ var o = this; // map over the object...
    				if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
    				if(k == rel_ && text_is(s)){ // the key should be '#' and have a text value.
    					o.id = s; // we found the soul!
    				} else {
    					return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
    				}
    			}
    		}());
    		Val.link.ify = function(t){ return obj_put({}, rel_, t) }; // convert a soul into a relation and return it.
    		Type.obj.has._ = '.';
    		var rel_ = Val.link._, u;
    		var bi_is = Type.bi.is;
    		var num_is = Type.num.is;
    		var text_is = Type.text.is;
    		var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
    		module.exports = Val;
    	})(USE, './val');
    USE(function(module){
    		var Type = USE('./type');
    		var Val = USE('./val');
    		var Node = {_: '_'};
    		Node.soul = function(n, o){ return (n && n._ && n._[o || soul_]) }; // convenience function to check to see if there is a soul on a node and return it.
    		Node.soul.ify = function(n, o){ // put a soul on an object.
    			o = (typeof o === 'string')? {soul: o} : o || {};
    			n = n || {}; // make sure it exists.
    			n._ = n._ || {}; // make sure meta exists.
    			n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
    			return n;
    		};
    		Node.soul._ = Val.link._;
    (function(){
    			Node.is = function(n, cb, as){ var s; // checks to see if an object is a valid node.
    				if(!obj_is(n)){ return false } // must be an object.
    				if(s = Node.soul(n)){ // must have a soul on it.
    					return !obj_map(n, map, {as:as,cb:cb,s:s,n:n});
    				}
    				return false; // nope! This was not a valid node.
    			};
    			function map(v, k){ // we invert this because the way we check for this is via a negation.
    				if(k === Node._){ return } // skip over the metadata.
    				if(!Val.is(v)){ return true } // it is true that this is an invalid node.
    				if(this.cb){ this.cb.call(this.as, v, k, this.n, this.s); } // optionally callback each key/value.
    			}
    		}());
    (function(){
    			Node.ify = function(obj, o, as){ // returns a node from a shallow object.
    				if(!o){ o = {}; }
    				else if(typeof o === 'string'){ o = {soul: o}; }
    				else if(o instanceof Function){ o = {map: o}; }
    				if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}); }
    				if(o.node = Node.soul.ify(o.node || {}, o)){
    					obj_map(obj, map, {o:o,as:as});
    				}
    				return o.node; // This will only be a valid node if the object wasn't already deep!
    			};
    			function map(v, k){ var o = this.o, tmp, u; // iterate over each key/value.
    				if(o.map){
    					tmp = o.map.call(this.as, v, ''+k, o.node);
    					if(u === tmp){
    						obj_del(o.node, k);
    					} else
    					if(o.node){ o.node[k] = tmp; }
    					return;
    				}
    				if(Val.is(v)){
    					o.node[k] = v;
    				}
    			}
    		}());
    		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
    		var text = Type.text, text_random = text.random;
    		var soul_ = Node.soul._;
    		var u;
    		module.exports = Node;
    	})(USE, './node');
    USE(function(module){
    		var Type = USE('./type');
    		var Node = USE('./node');
    		function State(){
    			var t;
    			/*if(perf){
    				t = start + perf.now(); // Danger: Accuracy decays significantly over time, even if precise.
    			} else {*/
    				t = time();
    			//}
    			if(last < t){
    				return N = 0, last = t + State.drift;
    			}
    			return last = t + ((N += 1) / D) + State.drift;
    		}
    		var time = Type.time.is, last = -Infinity, N = 0, D = 1000; // WARNING! In the future, on machines that are D times faster than 2016AD machines, you will want to increase D by another several orders of magnitude so the processing speed never out paces the decimal resolution (increasing an integer effects the state accuracy).
    		var perf = (typeof performance !== 'undefined')? (performance.timing && performance) : false, start = (perf && perf.timing && perf.timing.navigationStart) || (perf = false);
    		State._ = '>';
    		State.drift = 0;
    		State.is = function(n, k, o){ // convenience function to get the state on a key on a node and return it.
    			var tmp = (k && n && n[N_] && n[N_][State._]) || o;
    			if(!tmp){ return }
    			return num_is(tmp = tmp[k])? tmp : -Infinity;
    		};
    		State.lex = function(){ return State().toString(36).replace('.','') };
    		State.ify = function(n, k, s, v, soul){ // put a key's state on a node.
    			if(!n || !n[N_]){ // reject if it is not node-like.
    				if(!soul){ // unless they passed a soul
    					return;
    				}
    				n = Node.soul.ify(n, soul); // then make it so!
    			}
    			var tmp = obj_as(n[N_], State._); // grab the states data.
    			if(u !== k && k !== N_){
    				if(num_is(s)){
    					tmp[k] = s; // add the valid state.
    				}
    				if(u !== v){ // Note: Not its job to check for valid values!
    					n[k] = v;
    				}
    			}
    			return n;
    		};
    		State.to = function(from, k, to){
    			var val = (from||{})[k];
    			if(obj_is(val)){
    				val = obj_copy(val);
    			}
    			return State.ify(to, k, State.is(from, k), val, Node.soul(from));
    		}
    		;(function(){
    			State.map = function(cb, s, as){ var u; // for use with Node.ify
    				var o = obj_is(o = cb || s)? o : null;
    				cb = fn_is(cb = cb || s)? cb : null;
    				if(o && !cb){
    					s = num_is(s)? s : State();
    					o[N_] = o[N_] || {};
    					obj_map(o, map, {o:o,s:s});
    					return o;
    				}
    				as = as || obj_is(s)? s : u;
    				s = num_is(s)? s : State();
    				return function(v, k, o, opt){
    					if(!cb){
    						map.call({o: o, s: s}, v,k);
    						return v;
    					}
    					cb.call(as || this || {}, v, k, o, opt);
    					if(obj_has(o,k) && u === o[k]){ return }
    					map.call({o: o, s: s}, v,k);
    				}
    			};
    			function map(v,k){
    				if(N_ === k){ return }
    				State.ify(this.o, k, this.s) ;
    			}
    		}());
    		var obj = Type.obj, obj_as = obj.as, obj_has = obj.has, obj_is = obj.is, obj_map = obj.map, obj_copy = obj.copy;
    		var num = Type.num, num_is = num.is;
    		var fn = Type.fn, fn_is = fn.is;
    		var N_ = Node._, u;
    		module.exports = State;
    	})(USE, './state');
    USE(function(module){
    		var Type = USE('./type');
    		var Val = USE('./val');
    		var Node = USE('./node');
    		var Graph = {};
    (function(){
    			Graph.is = function(g, cb, fn, as){ // checks to see if an object is a valid graph.
    				if(!g || !obj_is(g) || obj_empty(g)){ return false } // must be an object.
    				return !obj_map(g, map, {cb:cb,fn:fn,as:as}); // makes sure it wasn't an empty object.
    			};
    			function map(n, s){ // we invert this because the way'? we check for this is via a negation.
    				if(!n || s !== Node.soul(n) || !Node.is(n, this.fn, this.as)){ return true } // it is true that this is an invalid graph.
    				if(!this.cb){ return }
    				nf.n = n; nf.as = this.as; // sequential race conditions aren't races.
    				this.cb.call(nf.as, n, s, nf);
    			}
    			function nf(fn){ // optional callback for each node.
    				if(fn){ Node.is(nf.n, fn, nf.as); } // where we then have an optional callback for each key/value.
    			}
    		}());
    (function(){
    			Graph.ify = function(obj, env, as){
    				var at = {path: [], obj: obj};
    				if(!env){
    					env = {};
    				} else
    				if(typeof env === 'string'){
    					env = {soul: env};
    				} else
    				if(env instanceof Function){
    					env.map = env;
    				}
    				if(env.soul){
    					at.link = Val.link.ify(env.soul);
    				}
    				env.shell = (as||{}).shell;
    				env.graph = env.graph || {};
    				env.seen = env.seen || [];
    				env.as = env.as || as;
    				node(env, at);
    				env.root = at.node;
    				return env.graph;
    			};
    			function node(env, at){ var tmp;
    				if(tmp = seen(env, at)){ return tmp }
    				at.env = env;
    				at.soul = soul;
    				if(Node.ify(at.obj, map, at)){
    					at.link = at.link || Val.link.ify(Node.soul(at.node));
    					if(at.obj !== env.shell){
    						env.graph[Val.link.is(at.link)] = at.node;
    					}
    				}
    				return at;
    			}
    			function map(v,k,n){
    				var at = this, env = at.env, is, tmp;
    				if(Node._ === k && obj_has(v,Val.link._)){
    					return n._; // TODO: Bug?
    				}
    				if(!(is = valid(v,k,n, at,env))){ return }
    				if(!k){
    					at.node = at.node || n || {};
    					if(obj_has(v, Node._) && Node.soul(v)){ // ? for safety ?
    						at.node._ = obj_copy(v._);
    					}
    					at.node = Node.soul.ify(at.node, Val.link.is(at.link));
    					at.link = at.link || Val.link.ify(Node.soul(at.node));
    				}
    				if(tmp = env.map){
    					tmp.call(env.as || {}, v,k,n, at);
    					if(obj_has(n,k)){
    						v = n[k];
    						if(u === v){
    							obj_del(n, k);
    							return;
    						}
    						if(!(is = valid(v,k,n, at,env))){ return }
    					}
    				}
    				if(!k){ return at.node }
    				if(true === is){
    					return v;
    				}
    				tmp = node(env, {obj: v, path: at.path.concat(k)});
    				if(!tmp.node){ return }
    				return tmp.link; //{'#': Node.soul(tmp.node)};
    			}
    			function soul(id){ var at = this;
    				var prev = Val.link.is(at.link), graph = at.env.graph;
    				at.link = at.link || Val.link.ify(id);
    				at.link[Val.link._] = id;
    				if(at.node && at.node[Node._]){
    					at.node[Node._][Val.link._] = id;
    				}
    				if(obj_has(graph, prev)){
    					graph[id] = graph[prev];
    					obj_del(graph, prev);
    				}
    			}
    			function valid(v,k,n, at,env){ var tmp;
    				if(Val.is(v)){ return true }
    				if(obj_is(v)){ return 1 }
    				if(tmp = env.invalid){
    					v = tmp.call(env.as || {}, v,k,n);
    					return valid(v,k,n, at,env);
    				}
    				env.err = "Invalid value at '" + at.path.concat(k).join('.') + "'!";
    				if(Type.list.is(v)){ env.err += " Use `.set(item)` instead of an Array."; }
    			}
    			function seen(env, at){
    				var arr = env.seen, i = arr.length, has;
    				while(i--){ has = arr[i];
    					if(at.obj === has.obj){ return has }
    				}
    				arr.push(at);
    			}
    		}());
    		Graph.node = function(node){
    			var soul = Node.soul(node);
    			if(!soul){ return }
    			return obj_put({}, soul, node);
    		}
    		;(function(){
    			Graph.to = function(graph, root, opt){
    				if(!graph){ return }
    				var obj = {};
    				opt = opt || {seen: {}};
    				obj_map(graph[root], map, {obj:obj, graph: graph, opt: opt});
    				return obj;
    			};
    			function map(v,k){ var tmp, obj;
    				if(Node._ === k){
    					if(obj_empty(v, Val.link._)){
    						return;
    					}
    					this.obj[k] = obj_copy(v);
    					return;
    				}
    				if(!(tmp = Val.link.is(v))){
    					this.obj[k] = v;
    					return;
    				}
    				if(obj = this.opt.seen[tmp]){
    					this.obj[k] = obj;
    					return;
    				}
    				this.obj[k] = this.opt.seen[tmp] = Graph.to(this.graph, tmp, this.opt);
    			}
    		}());
    		var fn_is = Type.fn.is;
    		var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_has = obj.has, obj_empty = obj.empty, obj_put = obj.put, obj_map = obj.map, obj_copy = obj.copy;
    		var u;
    		module.exports = Graph;
    	})(USE, './graph');
    USE(function(module){
    		// request / response module, for asking and acking messages.
    		USE('./onto'); // depends upon onto!
    		module.exports = function ask(cb, as){
    			if(!this.on){ return }
    			if(!(cb instanceof Function)){
    				if(!cb || !as){ return }
    				var id = cb['#'] || cb, tmp = (this.tag||empty)[id];
    				if(!tmp){ return }
    				tmp = this.on(id, as);
    				clearTimeout(tmp.err);
    				return true;
    			}
    			var id = (as && as['#']) || Math.random().toString(36).slice(2);
    			if(!cb){ return id }
    			var to = this.on(id, cb, as);
    			to.err = to.err || setTimeout(function(){
    				to.next({err: "Error: No ACK received yet.", lack: true});
    				to.off();
    			}, (this.opt||{}).lack || 9000);
    			return id;
    		};
    	})(USE, './ask');
    USE(function(module){
    		var Type = USE('./type');
    		function Dup(opt){
    			var dup = {s:{}};
    			opt = opt || {max: 1000, age: /*1000 * 9};//*/ 1000 * 9 * 3};
    			dup.check = function(id){ var tmp;
    				if(!(tmp = dup.s[id])){ return false }
    				if(tmp.pass){ return tmp.pass = false }
    				return dup.track(id);
    			};
    			dup.track = function(id, pass){
    				var it = dup.s[id] || (dup.s[id] = {});
    				it.was = time_is();
    				if(pass){ it.pass = true; }
    				if(!dup.to){ dup.to = setTimeout(dup.drop, opt.age + 9); }
    				return it;
    			};
    			dup.drop = function(age){
    				var now = time_is();
    				Type.obj.map(dup.s, function(it, id){
    					if(it && (age || opt.age) > (now - it.was)){ return }
    					Type.obj.del(dup.s, id);
    				});
    				dup.to = null;
    			};
    			return dup;
    		}
    		var time_is = Type.time.is;
    		module.exports = Dup;
    	})(USE, './dup');
    USE(function(module){

    		function Gun(o){
    			if(o instanceof Gun){ return (this._ = {gun: this, $: this}).$ }
    			if(!(this instanceof Gun)){ return new Gun(o) }
    			return Gun.create(this._ = {gun: this, $: this, opt: o});
    		}

    		Gun.is = function($){ return ($ instanceof Gun) || ($ && $._ && ($ === $._.$)) || false };

    		Gun.version = 0.9;

    		Gun.chain = Gun.prototype;
    		Gun.chain.toJSON = function(){};

    		var Type = USE('./type');
    		Type.obj.to(Type, Gun);
    		Gun.HAM = USE('./HAM');
    		Gun.val = USE('./val');
    		Gun.node = USE('./node');
    		Gun.state = USE('./state');
    		Gun.graph = USE('./graph');
    		Gun.on = USE('./onto');
    		Gun.ask = USE('./ask');
    		Gun.dup = USE('./dup');
    (function(){
    			Gun.create = function(at){
    				at.root = at.root || at;
    				at.graph = at.graph || {};
    				at.on = at.on || Gun.on;
    				at.ask = at.ask || Gun.ask;
    				at.dup = at.dup || Gun.dup();
    				var gun = at.$.opt(at.opt);
    				if(!at.once){
    					at.on('in', root, at);
    					at.on('out', root, {at: at, out: root});
    					Gun.on('create', at);
    					at.on('create', at);
    				}
    				at.once = 1;
    				return gun;
    			};
    			function root(msg){
    				//add to.next(at); // TODO: MISSING FEATURE!!!
    				var ev = this, as = ev.as, at = as.at || as, gun = at.$, dup, tmp;
    				if(!(tmp = msg['#'])){ tmp = msg['#'] = text_rand(9); }
    				if((dup = at.dup).check(tmp)){
    					if(as.out === msg.out){
    						msg.out = u;
    						ev.to.next(msg);
    					}
    					return;
    				}
    				dup.track(tmp);
    				if(tmp = msg['@']){ dup.track(tmp); } // HNPERF: Bump original request's liveliness.
    				if(!at.ask(tmp, msg)){
    					if(msg.get){
    						Gun.on.get(msg, gun); //at.on('get', get(msg));
    					}
    					if(msg.put){
    						Gun.on.put(msg, gun); //at.on('put', put(msg));
    					}
    				}
    				ev.to.next(msg);
    				if(!as.out){
    					msg.out = root;
    					at.on('out', msg);
    				}
    			}
    		}());
    (function(){
    			Gun.on.put = function(msg, gun){
    				var at = gun._, ctx = {$: gun, graph: at.graph, put: {}, map: {}, souls: {}, machine: Gun.state(), ack: msg['@'], cat: at, stop: {}};
    				if(!Gun.obj.map(msg.put, perf, ctx)){ return } // HNPERF: performance test, not core code, do not port.
    				if(!Gun.graph.is(msg.put, null, verify, ctx)){ ctx.err = "Error: Invalid graph!"; }
    				if(ctx.err){ return at.on('in', {'@': msg['#'], err: Gun.log(ctx.err) }) }
    				obj_map(ctx.put, merge, ctx);
    				if(!ctx.async){ obj_map(ctx.map, map, ctx); }
    				if(u !== ctx.defer){
    					var to = ctx.defer - ctx.machine;
    					setTimeout(function(){
    						Gun.on.put(msg, gun);
    					}, to > MD? MD : to ); // setTimeout Max Defer 32bit :(
    				}
    				if(!ctx.diff){ return }
    				at.on('put', obj_to(msg, {put: ctx.diff}));
    			};
    			var MD = 2147483647;
    			function verify(val, key, node, soul){ var ctx = this;
    				var state = Gun.state.is(node, key);
    				if(!state){ return ctx.err = "Error: No state on '"+key+"' in node '"+soul+"'!" }
    				var vertex = ctx.graph[soul] || empty, was = Gun.state.is(vertex, key, true), known = vertex[key];
    				var HAM = Gun.HAM(ctx.machine, state, was, val, known);
    				if(!HAM.incoming){
    					if(HAM.defer){ // pick the lowest
    						ctx.defer = (state < (ctx.defer || Infinity))? state : ctx.defer;
    					}
    					return;
    				}
    				ctx.put[soul] = Gun.state.to(node, key, ctx.put[soul]);
    				(ctx.diff || (ctx.diff = {}))[soul] = Gun.state.to(node, key, ctx.diff[soul]);
    				ctx.souls[soul] = true;
    			}
    			function merge(node, soul){
    				var ctx = this, cat = ctx.$._, at = (cat.next || empty)[soul];
    				if(!at){
    					if(!(cat.opt||empty).super){
    						ctx.souls[soul] = false;
    						return;
    					}
    					at = (ctx.$.get(soul)._);
    				}
    				var msg = ctx.map[soul] = {
    					put: node,
    					get: soul,
    					$: at.$
    				}, as = {ctx: ctx, msg: msg};
    				ctx.async = !!cat.tag.node;
    				if(ctx.ack){ msg['@'] = ctx.ack; }
    				obj_map(node, each, as);
    				if(!ctx.async){ return }
    				if(!ctx.and){
    					// If it is async, we only need to setup one listener per context (ctx)
    					cat.on('node', function(m){
    						this.to.next(m); // make sure to call other context's listeners.
    						if(m !== ctx.map[m.get]){ return } // filter out events not from this context!
    						ctx.souls[m.get] = false; // set our many-async flag
    						obj_map(m.put, patch, m); // merge into view
    						if(obj_map(ctx.souls, function(v){ if(v){ return v } })){ return } // if flag still outstanding, keep waiting.
    						if(ctx.c){ return } ctx.c = 1; // failsafe for only being called once per context.
    						this.off();
    						obj_map(ctx.map, map, ctx); // all done, trigger chains.
    					});
    				}
    				ctx.and = true;
    				cat.on('node', msg); // each node on the current context's graph needs to be emitted though.
    			}
    			function each(val, key){
    				var ctx = this.ctx, graph = ctx.graph, msg = this.msg, soul = msg.get, node = msg.put, at = (msg.$._);
    				graph[soul] = Gun.state.to(node, key, graph[soul]);
    				if(ctx.async){ return }
    				at.put = Gun.state.to(node, key, at.put);
    			}
    			function patch(val, key){
    				var msg = this, node = msg.put, at = (msg.$._);
    				at.put = Gun.state.to(node, key, at.put);
    			}
    			function map(msg, soul){
    				if(!msg.$){ return }
    				this.cat.stop = this.stop; // temporary fix till a better solution?
    				(msg.$._).on('in', msg);
    				this.cat.stop = null; // temporary fix till a better solution?
    			}
    			function perf(node, soul){ if(node !== this.graph[soul]){ return true } } // HNPERF: do not port!

    			Gun.on.get = function(msg, gun){
    				var root = gun._, get = msg.get, soul = get[_soul], node = root.graph[soul], has = get[_has], tmp;
    				var next = root.next || (root.next = {}), at = next[soul];
    				// queue concurrent GETs?
    				if(!node){ return root.on('get', msg) }
    				if(has){
    					if('string' != typeof has || !obj_has(node, has)){ return root.on('get', msg) }
    					node = Gun.state.to(node, has);
    					// If we have a key in-memory, do we really need to fetch?
    					// Maybe... in case the in-memory key we have is a local write
    					// we still need to trigger a pull/merge from peers.
    				} else {
    					node = Gun.window? Gun.obj.copy(node) : node; // HNPERF: If !browser bump Performance? Is this too dangerous to reference root graph? Copy / shallow copy too expensive for big nodes. Gun.obj.to(node); // 1 layer deep copy // Gun.obj.copy(node); // too slow on big nodes
    				}
    				node = Gun.graph.node(node);
    				tmp = (at||empty).ack;
    				var faith = function(){}; faith.faith = true; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
    				root.on('in', {
    					'@': msg['#'],
    					how: 'mem',
    					put: node,
    					$: gun,
    					_: faith
    				});
    				//if(0 < tmp){ return }
    				root.on('get', msg);
    			};
    		}());
    (function(){
    			Gun.chain.opt = function(opt){
    				opt = opt || {};
    				var gun = this, at = gun._, tmp = opt.peers || opt;
    				if(!obj_is(opt)){ opt = {}; }
    				if(!obj_is(at.opt)){ at.opt = opt; }
    				if(text_is(tmp)){ tmp = [tmp]; }
    				if(list_is(tmp)){
    					tmp = obj_map(tmp, function(url, i, map){
    						i = {}; i.id = i.url = url; map(url, i);
    					});
    					if(!obj_is(at.opt.peers)){ at.opt.peers = {};}
    					at.opt.peers = obj_to(tmp, at.opt.peers);
    				}
    				at.opt.peers = at.opt.peers || {};
    				obj_map(opt, function each(v,k){
    					if(!obj_has(this, k) || text.is(v) || obj.empty(v)){ this[k] = v ; return }
    					if(v && v.constructor !== Object && !list_is(v)){ return }
    					obj_map(v, each, this[k]);
    				}, at.opt);
    				Gun.on('opt', at);
    				at.opt.uuid = at.opt.uuid || function(){ return state_lex() + text_rand(12) };
    				return gun;
    			};
    		}());

    		var list_is = Gun.list.is;
    		var text = Gun.text, text_is = text.is, text_rand = text.random;
    		var obj = Gun.obj, obj_is = obj.is, obj_has = obj.has, obj_to = obj.to, obj_map = obj.map, obj_copy = obj.copy;
    		var state_lex = Gun.state.lex, _soul = Gun.val.link._, _has = '.', node_ = Gun.node._, rel_is = Gun.val.link.is;
    		var empty = {}, u;

    		console.only = function(i, s){ return (console.only.i && i === console.only.i && console.only.i++) && (console.log.apply(console, arguments) || s) };

    		Gun.log = function(){ return (!Gun.log.off && console.log.apply(console, arguments)), [].slice.call(arguments).join(' ') };
    		Gun.log.once = function(w,s,o){ return (o = Gun.log.once)[w] = o[w] || 0, o[w]++ || Gun.log(s) }

    		;		Gun.log.once("welcome", "Hello wonderful person! :) Thanks for using GUN, feel free to ask for help on https://gitter.im/amark/gun and ask StackOverflow questions tagged with 'gun'!");

    		if(typeof window !== "undefined"){ (window.GUN = window.Gun = Gun).window = window; }
    		try{ if(typeof common !== "undefined"){ common.exports = Gun; } }catch(e){}
    		module.exports = Gun;

    		/*Gun.on('opt', function(ctx){ // FOR TESTING PURPOSES
    			this.to.next(ctx);
    			if(ctx.once){ return }
    			ctx.on('node', function(msg){
    				var to = this.to;
    				//Gun.node.is(msg.put, function(v,k){ msg.put[k] = v + v });
    				setTimeout(function(){
    					to.next(msg);
    				},1);
    			});
    		});*/
    	})(USE, './root');
    USE(function(module){
    		var Gun = USE('./root');
    		Gun.chain.back = function(n, opt){ var tmp;
    			n = n || 1;
    			if(-1 === n || Infinity === n){
    				return this._.root.$;
    			} else
    			if(1 === n){
    				return (this._.back || this._).$;
    			}
    			var gun = this, at = gun._;
    			if(typeof n === 'string'){
    				n = n.split('.');
    			}
    			if(n instanceof Array){
    				var i = 0, l = n.length, tmp = at;
    				for(i; i < l; i++){
    					tmp = (tmp||empty)[n[i]];
    				}
    				if(u !== tmp){
    					return opt? gun : tmp;
    				} else
    				if((tmp = at.back)){
    					return tmp.$.back(n, opt);
    				}
    				return;
    			}
    			if(n instanceof Function){
    				var yes, tmp = {back: at};
    				while((tmp = tmp.back)
    				&& u === (yes = n(tmp, opt))){}
    				return yes;
    			}
    			if(Gun.num.is(n)){
    				return (at.back || at).$.back(n - 1);
    			}
    			return this;
    		};
    		var empty = {}, u;
    	})(USE, './back');
    USE(function(module){
    		// WARNING: GUN is very simple, but the JavaScript chaining API around GUN
    		// is complicated and was extremely hard to build. If you port GUN to another
    		// language, consider implementing an easier API to build.
    		var Gun = USE('./root');
    		Gun.chain.chain = function(sub){
    			var gun = this, at = gun._, chain = new (sub || gun).constructor(gun), cat = chain._, root;
    			cat.root = root = at.root;
    			cat.id = ++root.once;
    			cat.back = gun._;
    			cat.on = Gun.on;
    			cat.on('in', input, cat); // For 'in' if I add my own listeners to each then I MUST do it before in gets called. If I listen globally for all incoming data instead though, regardless of individual listeners, I can transform the data there and then as well.
    			cat.on('out', output, cat); // However for output, there isn't really the global option. I must listen by adding my own listener individually BEFORE this one is ever called.
    			return chain;
    		};

    		function output(msg){
    			var put, get, at = this.as, back = at.back, root = at.root, tmp;
    			if(!msg.$){ msg.$ = at.$; }
    			this.to.next(msg);
    			if(get = msg.get){
    				/*if(u !== at.put){
    					at.on('in', at);
    					return;
    				}*/
    				if(at.lex){ msg.get = obj_to(at.lex, msg.get); }
    				if(get['#'] || at.soul){
    					get['#'] = get['#'] || at.soul;
    					msg['#'] || (msg['#'] = text_rand(9));
    					back = (root.$.get(get['#'])._);
    					if(!(get = get['.'])){
    						tmp = back.ack;
    						if(!tmp){ back.ack = -1; }
    						if(obj_has(back, 'put')){
    							back.on('in', back);
    						}
    						if(tmp && u !== back.put){ return } //if(tmp){ return }
    						msg.$ = back.$;
    					} else
    					if(obj_has(back.put, get)){ // TODO: support #LEX !
    						put = (back.$.get(get)._);
    						if(!(tmp = put.ack)){ put.ack = -1; }
    						back.on('in', {
    							$: back.$,
    							put: Gun.state.to(back.put, get),
    							get: back.get
    						});
    						if(tmp){ return }
    					} else
    					if('string' != typeof get){
    						var put = {}, meta = (back.put||{})._;
    						Gun.obj.map(back.put, function(v,k){
    							if(!Gun.text.match(k, get)){ return }
    							put[k] = v;
    						});
    						if(!Gun.obj.empty(put)){
    							put._ = meta;
    							back.on('in', {$: back.$, put: put, get: back.get});
    						}
    					}
    					root.ask(ack, msg);
    					return root.on('in', msg);
    				}
    				if(root.now){ root.now[at.id] = root.now[at.id] || true; at.pass = {}; }
    				if(get['.']){
    					if(at.get){
    						msg = {get: {'.': at.get}, $: at.$};
    						//if(back.ask || (back.ask = {})[at.get]){ return }
    						(back.ask || (back.ask = {}));
    						back.ask[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
    						return back.on('out', msg);
    					}
    					msg = {get: {}, $: at.$};
    					return back.on('out', msg);
    				}
    				at.ack = at.ack || -1;
    				if(at.get){
    					msg.$ = at.$;
    					get['.'] = at.get;
    					(back.ask || (back.ask = {}))[at.get] = msg.$._; // TODO: PERFORMANCE? More elegant way?
    					return back.on('out', msg);
    				}
    			}
    			return back.on('out', msg);
    		}

    		function input(msg){
    			var eve = this, cat = eve.as, root = cat.root, gun = msg.$, at = (gun||empty)._ || empty, change = msg.put, rel, tmp;
    			if(cat.get && msg.get !== cat.get){
    				msg = obj_to(msg, {get: cat.get});
    			}
    			if(cat.has && at !== cat){
    				msg = obj_to(msg, {$: cat.$});
    				if(at.ack){
    					cat.ack = at.ack;
    					//cat.ack = cat.ack || at.ack;
    				}
    			}
    			if(u === change){
    				tmp = at.put;
    				eve.to.next(msg);
    				if(cat.soul){ return } // TODO: BUG, I believee the fresh input refactor caught an edge case that a `gun.get('soul').get('key')` that points to a soul that doesn't exist will not trigger val/get etc.
    				if(u === tmp && u !== at.put){ return }
    				echo(cat, msg);
    				if(cat.has){
    					not(cat, msg);
    				}
    				obj_del(at.echo, cat.id);
    				obj_del(cat.map, at.id);
    				return;
    			}
    			if(cat.soul){
    				eve.to.next(msg);
    				echo(cat, msg);
    				if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}); }
    				return;
    			}
    			if(!(rel = Gun.val.link.is(change))){
    				if(Gun.val.is(change)){
    					if(cat.has || cat.soul){
    						not(cat, msg);
    					} else
    					if(at.has || at.soul){
    						(at.echo || (at.echo = {}))[cat.id] = at.echo[at.id] || cat;
    						(cat.map || (cat.map = {}))[at.id] = cat.map[at.id] || {at: at};
    						//if(u === at.put){ return } // Not necessary but improves performance. If we have it but at does not, that means we got things out of order and at will get it. Once at gets it, it will tell us again.
    					}
    					eve.to.next(msg);
    					echo(cat, msg);
    					return;
    				}
    				if(cat.has && at !== cat && obj_has(at, 'put')){
    					cat.put = at.put;
    				}				if((rel = Gun.node.soul(change)) && at.has){
    					at.put = (cat.root.$.get(rel)._).put;
    				}
    				tmp = (root.stop || {})[at.id];
    				//if(tmp && tmp[cat.id]){ } else {
    					eve.to.next(msg);
    				//}
    				relate(cat, msg, at, rel);
    				echo(cat, msg);
    				if(cat.next){ obj_map(change, map, {msg: msg, cat: cat}); }
    				return;
    			}
    			var was = root.stop;
    			tmp = root.stop || {};
    			tmp = tmp[at.id] || (tmp[at.id] = {});
    			//if(tmp[cat.id]){ return }
    			tmp.is = tmp.is || at.put;
    			tmp[cat.id] = at.put || true;
    			//if(root.stop){
    				eve.to.next(msg);
    			//}
    			relate(cat, msg, at, rel);
    			echo(cat, msg);
    		}

    		function relate(at, msg, from, rel){
    			if(!rel || node_ === at.get){ return }
    			var tmp = (at.root.$.get(rel)._);
    			if(at.has){
    				from = tmp;
    			} else
    			if(from.has){
    				relate(from, msg, from, rel);
    			}
    			if(from === at){ return }
    			if(!from.$){ from = {}; }
    			(from.echo || (from.echo = {}))[at.id] = from.echo[at.id] || at;
    			if(at.has && !(at.map||empty)[from.id]){ // if we haven't seen this before.
    				not(at, msg);
    			}
    			tmp = from.id? ((at.map || (at.map = {}))[from.id] = at.map[from.id] || {at: from}) : {};
    			if(rel === tmp.link){
    				if(!(tmp.pass || at.pass)){
    					return;
    				}
    			}
    			if(at.pass){
    				Gun.obj.map(at.map, function(tmp){ tmp.pass = true; });
    				obj_del(at, 'pass');
    			}
    			if(tmp.pass){ obj_del(tmp, 'pass'); }
    			if(at.has){ at.link = rel; }
    			ask(at, tmp.link = rel);
    		}
    		function echo(at, msg, ev){
    			if(!at.echo){ return } // || node_ === at.get ?
    			//if(at.has){ msg = obj_to(msg, {event: ev}) }
    			obj_map(at.echo, reverb, msg);
    		}
    		function reverb(to){
    			if(!to || !to.on){ return }
    			to.on('in', this);
    		}
    		function map(data, key){ // Map over only the changes on every update.
    			var cat = this.cat, next = cat.next || empty, via = this.msg, chain, at, tmp;
    			if(node_ === key && !next[key]){ return }
    			if(!(at = next[key])){
    				return;
    			}
    			//if(data && data[_soul] && (tmp = Gun.val.link.is(data)) && (tmp = (cat.root.$.get(tmp)._)) && obj_has(tmp, 'put')){
    			//	data = tmp.put;
    			//}
    			if(at.has){
    				//if(!(data && data[_soul] && Gun.val.link.is(data) === Gun.node.soul(at.put))){
    				if(u === at.put || !Gun.val.link.is(data)){
    					at.put = data;
    				}
    				chain = at.$;
    			} else
    			if(tmp = via.$){
    				tmp = (chain = via.$.get(key))._;
    				if(u === tmp.put || !Gun.val.link.is(data)){
    					tmp.put = data;
    				}
    			}
    			at.on('in', {
    				put: data,
    				get: key,
    				$: chain,
    				via: via
    			});
    		}
    		function not(at, msg){
    			if(!(at.has || at.soul)){ return }
    			var tmp = at.map, root = at.root;
    			at.map = null;
    			if(at.has){
    				if(at.dub && at.root.stop){ at.dub = null; }
    				at.link = null;
    			}
    			//if(!root.now || !root.now[at.id]){
    			if(!at.pass){
    				if((!msg['@']) && null === tmp){ return }
    				//obj_del(at, 'pass');
    			}
    			if(u === tmp && Gun.val.link.is(at.put)){ return } // This prevents the very first call of a thing from triggering a "clean up" call. // TODO: link.is(at.put) || !val.is(at.put) ?
    			obj_map(tmp, function(proxy){
    				if(!(proxy = proxy.at)){ return }
    				obj_del(proxy.echo, at.id);
    			});
    			tmp = at.put;
    			obj_map(at.next, function(neat, key){
    				if(u === tmp && u !== at.put){ return true }
    				neat.put = u;
    				if(neat.ack){
    					neat.ack = -1; // Shouldn't this be reset to 0? If we do that, SEA test `set user ref should be found` fails, odd.
    				}
    				neat.on('in', {
    					get: key,
    					$: neat.$,
    					put: u
    				});
    			});
    		}
    		function ask(at, soul){
    			var tmp = (at.root.$.get(soul)._), lex = at.lex;
    			if(at.ack || lex){
    				(lex = lex||{})['#'] = soul;
    				tmp.on('out', {get: lex});
    				if(!at.ask){ return } // TODO: PERFORMANCE? More elegant way?
    			}
    			tmp = at.ask; Gun.obj.del(at, 'ask');
    			obj_map(tmp || at.next, function(neat, key){
    				var lex = neat.lex || {}; lex['#'] = soul; lex['.'] = lex['.'] || key;
    				neat.on('out', {get: lex});
    			});
    			Gun.obj.del(at, 'ask'); // TODO: PERFORMANCE? More elegant way?
    		}
    		function ack(msg, ev){
    			var as = this.as, get = as.get || empty, at = as.$._, tmp = (msg.put||empty)[get['#']];
    			if(at.ack){ at.ack = (at.ack + 1) || 1; }
    			if(!msg.put || ('string' == typeof get['.'] && !obj_has(tmp, at.get))){
    				if(at.put !== u){ return }
    				at.on('in', {
    					get: at.get,
    					put: at.put = u,
    					$: at.$,
    					'@': msg['@']
    				});
    				return;
    			}
    			if(node_ == get['.']){ // is this a security concern?
    				at.on('in', {get: at.get, put: Gun.val.link.ify(get['#']), $: at.$, '@': msg['@']});
    				return;
    			}
    			Gun.on.put(msg, at.root.$);
    		}
    		var empty = {}, u;
    		var obj = Gun.obj, obj_has = obj.has, obj_put = obj.put, obj_del = obj.del, obj_to = obj.to, obj_map = obj.map;
    		var text_rand = Gun.text.random;
    		var _soul = Gun.val.link._, node_ = Gun.node._;
    	})(USE, './chain');
    USE(function(module){
    		var Gun = USE('./root');
    		Gun.chain.get = function(key, cb, as){
    			var gun, tmp;
    			if(typeof key === 'string'){
    				var back = this, cat = back._;
    				var next = cat.next || empty;
    				if(!(gun = next[key])){
    					gun = cache(key, back);
    				}
    				gun = gun.$;
    			} else
    			if(key instanceof Function){
    				if(true === cb){ return soul(this, key, cb, as), this }
    				gun = this;
    				var at = gun._, root = at.root, tmp = root.now, ev;
    				as = cb || {};
    				as.at = at;
    				as.use = key;
    				as.out = as.out || {};
    				as.out.get = as.out.get || {};
    				(ev = at.on('in', use, as)).rid = rid;
    				(root.now = {$:1})[as.now = at.id] = ev;
    				var mum = root.mum; root.mum = {};
    				at.on('out', as.out);
    				root.mum = mum;
    				root.now = tmp;
    				return gun;
    			} else
    			if(num_is(key)){
    				return this.get(''+key, cb, as);
    			} else
    			if(tmp = rel.is(key)){
    				return this.get(tmp, cb, as);
    			} else
    			if(obj.is(key)){
    				gun = this;
    				if(tmp = ((tmp = key['#'])||empty)['='] || tmp){ gun = gun.get(tmp); }
    				gun._.lex = key;
    				return gun;
    			} else {
    				(as = this.chain())._.err = {err: Gun.log('Invalid get request!', key)}; // CLEAN UP
    				if(cb){ cb.call(as, as._.err); }
    				return as;
    			}
    			if(tmp = this._.stun){ // TODO: Refactor?
    				gun._.stun = gun._.stun || tmp;
    			}
    			if(cb && cb instanceof Function){
    				gun.get(cb, as);
    			}
    			return gun;
    		};
    		function cache(key, back){
    			var cat = back._, next = cat.next, gun = back.chain(), at = gun._;
    			if(!next){ next = cat.next = {}; }
    			next[at.get = key] = at;
    			if(back === cat.root.$){
    				at.soul = key;
    			} else
    			if(cat.soul || cat.has){
    				at.has = key;
    				//if(obj_has(cat.put, key)){
    					//at.put = cat.put[key];
    				//}
    			}
    			return at;
    		}
    		function soul(gun, cb, opt, as){
    			var cat = gun._, acks = 0, tmp;
    			if(tmp = cat.soul || cat.link || cat.dub){ return cb(tmp, as, cat) }
    			if(cat.jam){ return cat.jam.push([cb, as]) }
    			cat.jam = [[cb,as]];
    			gun.get(function go(msg, eve){
    				if(u === msg.put && (tmp = Object.keys(cat.root.opt.peers).length) && ++acks < tmp){
    					return;
    				}
    				eve.rid(msg);
    				var at = ((at = msg.$) && at._) || {}, i = 0, as;
    				tmp = cat.jam; delete cat.jam; // tmp = cat.jam.splice(0, 100);
    				//if(tmp.length){ process.nextTick(function(){ go(msg, eve) }) }
    				while(as = tmp[i++]){ //Gun.obj.map(tmp, function(as, cb){
    					var cb = as[0], id; as = as[1];
    					cb && cb(id = at.link || at.soul || rel.is(msg.put) || node_soul(msg.put) || at.dub, as, msg, eve);
    				} //);
    			}, {out: {get: {'.':true}}});
    			return gun;
    		}
    		function use(msg){
    			var eve = this, as = eve.as, cat = as.at, root = cat.root, gun = msg.$, at = (gun||{})._ || {}, data = msg.put || at.put, tmp;
    			if((tmp = root.now) && eve !== tmp[as.now]){ return eve.to.next(msg) }
    			//if(at.async && msg.root){ return }
    			//if(at.async === 1 && cat.async !== true){ return }
    			//if(root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);
    			//if(!at.async && !cat.async && at.put && msg.put === at.put){ return }
    			//else if(!cat.async && msg.put !== at.put && root.stop && root.stop[at.id]){ return } root.stop && (root.stop[at.id] = true);


    			//root.stop && (root.stop.id = root.stop.id || Gun.text.random(2));
    			//if((tmp = root.stop) && (tmp = tmp[at.id] || (tmp[at.id] = {})) && tmp[cat.id]){ return } tmp && (tmp[cat.id] = true);
    			if(eve.seen && at.id && eve.seen[at.id]){ return eve.to.next(msg) }
    			//if((tmp = root.stop)){ if(tmp[at.id]){ return } tmp[at.id] = msg.root; } // temporary fix till a better solution?
    			if((tmp = data) && tmp[rel._] && (tmp = rel.is(tmp))){
    				tmp = ((msg.$$ = at.root.gun.get(tmp))._);
    				if(u !== tmp.put){
    					msg = obj_to(msg, {put: data = tmp.put});
    				}
    			}
    			if((tmp = root.mum) && at.id){ // TODO: can we delete mum entirely now?
    				var id = at.id + (eve.id || (eve.id = Gun.text.random(9)));
    				if(tmp[id]){ return }
    				if(u !== data && !rel.is(data)){ tmp[id] = true; }
    			}
    			as.use(msg, eve);
    			if(eve.stun){
    				eve.stun = null;
    				return;
    			}
    			eve.to.next(msg);
    		}
    		function rid(at){
    			var cat = this.on;
    			if(!at || cat.soul || cat.has){ return this.off() }
    			if(!(at = (at = (at = at.$ || at)._ || at).id)){ return }
    			var map = cat.map, tmp, seen;
    			//if(!map || !(tmp = map[at]) || !(tmp = tmp.at)){ return }
    			if(tmp = (seen = this.seen || (this.seen = {}))[at]){ return true }
    			seen[at] = true;
    			return;
    		}
    		var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_to = Gun.obj.to;
    		var num_is = Gun.num.is;
    		var rel = Gun.val.link, node_soul = Gun.node.soul, node_ = Gun.node._;
    		var empty = {}, u;
    	})(USE, './get');
    USE(function(module){
    		var Gun = USE('./root');
    		Gun.chain.put = function(data, cb, as){
    			// #soul.has=value>state
    			// ~who#where.where=what>when@was
    			// TODO: BUG! Put probably cannot handle plural chains! `!as` is quickfix test.
    			var gun = this, at = (gun._), root = at.root.$, ctx = root._, tmp;
    			/*if(!ctx.puta && !as){ if(tmp = ctx.puts){ if(tmp > M){ // without this, when synchronous, writes to a 'not found' pile up, when 'not found' resolves it recursively calls `put` which incrementally resolves each write. Stack overflow limits can be as low as 10K, so this limit is hardcoded to 1% of 10K.
    				(ctx.stack || (ctx.stack = [])).push([gun, data, cb, as]);
    				if(ctx.puto){ return }
    				ctx.puto = setTimeout(function drain(){
    					var d = ctx.stack.splice(0,M), i = 0, at; ctx.puta = true;
    					while(at = d[i++]){ at[0].put(at[1], at[2], at[3]) } delete ctx.puta;
    					if(ctx.stack.length){ return ctx.puto = setTimeout(drain, 0) }
    					ctx.stack = ctx.puts = ctx.puto = null;
    				}, 0);
    				return gun;
    			} ++ctx.puts } else { ctx.puts = 1 } }*/
    			as = as || {};
    			as.data = data;
    			as.via = as.$ = as.via || as.$ || gun;
    			if(typeof cb === 'string'){
    				as.soul = cb;
    			} else {
    				as.ack = as.ack || cb;
    			}
    			if(at.soul){
    				as.soul = at.soul;
    			}
    			if(as.soul || root === gun){
    				if(!obj_is(as.data)){
    					(as.ack||noop).call(as, as.out = {err: Gun.log("Data saved to the root level of the graph must be a node (an object), not a", (typeof as.data), 'of "' + as.data + '"!')});
    					if(as.res){ as.res(); }
    					return gun;
    				}
    				as.soul = as.soul || (as.not = Gun.node.soul(as.data) || (as.via.back('opt.uuid') || Gun.text.random)());
    				if(!as.soul){ // polyfill async uuid for SEA
    					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
    						if(err){ return Gun.log(err) } // TODO: Handle error!
    						(as.ref||as.$).put(as.data, as.soul = soul, as);
    					});
    					return gun;
    				}
    				as.$ = root.get(as.soul);
    				as.ref = as.$;
    				ify(as);
    				return gun;
    			}
    			if(Gun.is(data)){
    				data.get(function(soul, o, msg){
    					if(!soul){
    						return Gun.log("The reference you are saving is a", typeof msg.put, '"'+ msg.put +'", not a node (object)!');
    					}
    					gun.put(Gun.val.link.ify(soul), cb, as);
    				}, true);
    				return gun;
    			}
    			if(at.has && (tmp = Gun.val.link.is(data))){ at.dub = tmp; }
    			as.ref = as.ref || (root._ === (tmp = at.back))? gun : tmp.$;
    			if(as.ref._.soul && Gun.val.is(as.data) && at.get){
    				as.data = obj_put({}, at.get, as.data);
    				as.ref.put(as.data, as.soul, as);
    				return gun;
    			}
    			as.ref.get(any, true, {as: as});
    			if(!as.out){
    				// TODO: Perf idea! Make a global lock, that blocks everything while it is on, but if it is on the lock it does the expensive lookup to see if it is a dependent write or not and if not then it proceeds full speed. Meh? For write heavy async apps that would be terrible.
    				as.res = as.res || stun; // Gun.on.stun(as.ref); // TODO: BUG! Deal with locking?
    				as.$._.stun = as.ref._.stun;
    			}
    			return gun;
    		};

    		function ify(as){
    			as.batch = batch;
    			var opt = as.opt||{}, env = as.env = Gun.state.map(map, opt.state);
    			env.soul = as.soul;
    			as.graph = Gun.graph.ify(as.data, env, as);
    			if(env.err){
    				(as.ack||noop).call(as, as.out = {err: Gun.log(env.err)});
    				if(as.res){ as.res(); }
    				return;
    			}
    			as.batch();
    		}

    		function stun(cb){
    			if(cb){ cb(); }
    			return;
    		}

    		function batch(){ var as = this;
    			if(!as.graph || obj_map(as.stun, no)){ return }
    			as.res = as.res || function(cb){ if(cb){ cb(); } };
    			as.res(function(){
    				var cat = (as.$.back(-1)._), ask = cat.ask(function(ack){
    					cat.root.on('ack', ack);
    					if(ack.err){ Gun.log(ack); }
    					if(++acks > (as.acks || 0)){ this.off(); } // Adjustable ACKs! Only 1 by default.
    					if(!as.ack){ return }
    					as.ack(ack, this);
    					//--C;
    				}, as.opt), acks = 0;
    				//C++;
    				// NOW is a hack to get synchronous replies to correctly call.
    				// and STOP is a hack to get async behavior to correctly call.
    				// neither of these are ideal, need to be fixed without hacks,
    				// but for now, this works for current tests. :/
    				var tmp = cat.root.now; obj.del(cat.root, 'now');
    				var mum = cat.root.mum; cat.root.mum = {};
    				(as.ref._).on('out', {
    					$: as.ref, put: as.out = as.env.graph, opt: as.opt, '#': ask
    				});
    				cat.root.mum = mum? obj.to(mum, cat.root.mum) : mum;
    				cat.root.now = tmp;
    			}, as);
    			if(as.res){ as.res(); }
    		} function no(v,k){ if(v){ return true } }

    		function map(v,k,n, at){ var as = this;
    			var is = Gun.is(v);
    			if(k || !at.path.length){ return }
    			(as.res||iife)(function(){
    				var path = at.path, ref = as.ref, opt = as.opt;
    				var i = 0, l = path.length;
    				for(i; i < l; i++){
    					ref = ref.get(path[i]);
    				}
    				if(is){ ref = v; }
    				//if(as.not){ (ref._).dub = Gun.text.random() } // This might optimize stuff? Maybe not needed anymore. Make sure it doesn't introduce bugs.
    				var id = (ref._).dub;
    				if(id || (id = Gun.node.soul(at.obj))){
    					ref.back(-1).get(id);
    					at.soul(id);
    					return;
    				}
    				(as.stun = as.stun || {})[path] = true;
    				ref.get(soul, true, {as: {at: at, as: as, p:path}});
    			}, {as: as, at: at});
    			//if(is){ return {} }
    		}

    		function soul(id, as, msg, eve){
    			var as = as.as, cat = as.at; as = as.as;
    			var at = ((msg || {}).$ || {})._ || {};
    			id = at.dub = at.dub || id || Gun.node.soul(cat.obj) || Gun.node.soul(msg.put || at.put) || Gun.val.link.is(msg.put || at.put) || (as.via.back('opt.uuid') || Gun.text.random)(); // TODO: BUG!? Do we really want the soul of the object given to us? Could that be dangerous?
    			if(eve){ eve.stun = true; }
    			if(!id){ // polyfill async uuid for SEA
    				as.via.back('opt.uuid')(function(err, id){ // TODO: improve perf without anonymous callback
    					if(err){ return Gun.log(err) } // TODO: Handle error.
    					solve(at, at.dub = at.dub || id, cat, as);
    				});
    				return;
    			}
    			solve(at, at.dub = id, cat, as);
    		}

    		function solve(at, id, cat, as){
    			at.$.back(-1).get(id);
    			cat.soul(id);
    			as.stun[cat.path] = false;
    			as.batch();
    		}

    		function any(soul, as, msg, eve){
    			as = as.as;
    			if(!msg.$ || !msg.$._){ return } // TODO: Handle
    			if(msg.err){ // TODO: Handle
    				Gun.log("Please report this as an issue! Put.any.err");
    				return;
    			}
    			var at = (msg.$._), data = at.put, opt = as.opt||{}, tmp;
    			if((tmp = as.ref) && tmp._.now){ return }
    			if(eve){ eve.stun = true; }
    			if(as.ref !== as.$){
    				tmp = (as.$._).get || at.get;
    				if(!tmp){ // TODO: Handle
    					Gun.log("Please report this as an issue! Put.no.get"); // TODO: BUG!??
    					return;
    				}
    				as.data = obj_put({}, tmp, as.data);
    				tmp = null;
    			}
    			if(u === data){
    				if(!at.get){ return } // TODO: Handle
    				if(!soul){
    					tmp = at.$.back(function(at){
    						if(at.link || at.soul){ return at.link || at.soul }
    						as.data = obj_put({}, at.get, as.data);
    					});
    					as.not = true; // maybe consider this?
    				}
    				tmp = tmp || at.soul || at.link || at.dub;// || at.get;
    				at = tmp? (at.root.$.get(tmp)._) : at;
    				as.soul = tmp;
    				data = as.data;
    			}
    			if(!as.not && !(as.soul = as.soul || soul)){
    				if(as.path && obj_is(as.data)){
    					as.soul = (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
    				} else {
    					//as.data = obj_put({}, as.$._.get, as.data);
    					if(node_ == at.get){
    						as.soul = (at.put||empty)['#'] || at.dub;
    					}
    					as.soul = as.soul || at.soul || at.link || (opt.uuid || as.via.back('opt.uuid') || Gun.text.random)();
    				}
    				if(!as.soul){ // polyfill async uuid for SEA
    					as.via.back('opt.uuid')(function(err, soul){ // TODO: improve perf without anonymous callback
    						if(err){ return Gun.log(err) } // Handle error.
    						as.ref.put(as.data, as.soul = soul, as);
    					});
    					return;
    				}
    			}
    			as.ref.put(as.data, as.soul, as);
    		}
    		var obj = Gun.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
    		var u, empty = {}, noop = function(){}, iife = function(fn,as){fn.call(as||empty);};
    		var node_ = Gun.node._;
    	})(USE, './put');
    USE(function(module){
    		var Gun = USE('./root');
    		USE('./chain');
    		USE('./back');
    		USE('./put');
    		USE('./get');
    		module.exports = Gun;
    	})(USE, './index');
    USE(function(module){
    		var Gun = USE('./index');
    		Gun.chain.on = function(tag, arg, eas, as){
    			var gun = this, at = gun._, act;
    			if(typeof tag === 'string'){
    				if(!arg){ return at.on(tag) }
    				act = at.on(tag, arg, eas || at, as);
    				if(eas && eas.$){
    					(eas.subs || (eas.subs = [])).push(act);
    				}
    				return gun;
    			}
    			var opt = arg;
    			opt = (true === opt)? {change: true} : opt || {};
    			opt.at = at;
    			opt.ok = tag;
    			//opt.last = {};
    			gun.get(ok, opt); // TODO: PERF! Event listener leak!!!?
    			return gun;
    		};

    		function ok(msg, ev){ var opt = this;
    			var gun = msg.$, at = (gun||{})._ || {}, data = at.put || msg.put, cat = opt.at, tmp;
    			if(u === data){
    				return;
    			}
    			if(tmp = msg.$$){
    				tmp = (msg.$$._);
    				if(u === tmp.put){
    					return;
    				}
    				data = tmp.put;
    			}
    			if(opt.change){ // TODO: BUG? Move above the undef checks?
    				data = msg.put;
    			}
    			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
    			//if(tmp.put === data && tmp.get === id && !Gun.node.soul(data)){ return }
    			//tmp.put = data;
    			//tmp.get = id;
    			// DEDUPLICATE // TODO: NEEDS WORK! BAD PROTOTYPE
    			//at.last = data;
    			if(opt.as){
    				opt.ok.call(opt.as, msg, ev);
    			} else {
    				opt.ok.call(gun, data, msg.get, msg, ev);
    			}
    		}

    		Gun.chain.val = function(cb, opt){
    			Gun.log.once("onceval", "Future Breaking API Change: .val -> .once, apologies unexpected.");
    			return this.once(cb, opt);
    		};
    		Gun.chain.once = function(cb, opt){
    			var gun = this, at = gun._, data = at.put;
    			if(0 < at.ack && u !== data){
    				(cb || noop).call(gun, data, at.get);
    				return gun;
    			}
    			if(cb){
    				(opt = opt || {}).ok = cb;
    				opt.at = at;
    				opt.out = {'#': Gun.text.random(9)};
    				gun.get(val, {as: opt});
    				opt.async = true; //opt.async = at.stun? 1 : true;
    			} else {
    				Gun.log.once("valonce", "Chainable val is experimental, its behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
    				var chain = gun.chain();
    				chain._.nix = gun.once(function(){
    					chain._.on('in', gun._);
    				});
    				return chain;
    			}
    			return gun;
    		};

    		function val(msg, eve, to){
    			if(!msg.$){ eve.off(); return }
    			var opt = this.as, cat = opt.at, gun = msg.$, at = gun._, data = at.put || msg.put, link, tmp;
    			if(tmp = msg.$$){
    				link = tmp = (msg.$$._);
    				if(u !== link.put){
    					data = link.put;
    				}
    			}
    			if((tmp = eve.wait) && (tmp = tmp[at.id])){ clearTimeout(tmp); }
    			eve.ack = (eve.ack||0)+1;
    			if(!to && u === data && eve.ack <= (opt.acks || Object.keys(at.root.opt.peers).length)){ return }
    			if((!to && (u === data || at.soul || at.link || (link && !(0 < link.ack))))
    			|| (u === data && (tmp = Object.keys(at.root.opt.peers).length) && (!to && (link||at).ack < tmp))){
    				tmp = (eve.wait = {})[at.id] = setTimeout(function(){
    					val.call({as:opt}, msg, eve, tmp || 1);
    				}, opt.wait || 99);
    				return;
    			}
    			if(link && u === link.put && (tmp = rel.is(data))){ data = Gun.node.ify({}, tmp); }
    			eve.rid? eve.rid(msg) : eve.off();
    			opt.ok.call(gun || opt.$, data, msg.get);
    		}

    		Gun.chain.off = function(){
    			// make off more aggressive. Warning, it might backfire!
    			var gun = this, at = gun._, tmp;
    			var cat = at.back;
    			if(!cat){ return }
    			at.ack = 0; // so can resubscribe.
    			if(tmp = cat.next){
    				if(tmp[at.get]){
    					obj_del(tmp, at.get);
    				}
    			}
    			if(tmp = cat.ask){
    				obj_del(tmp, at.get);
    			}
    			if(tmp = cat.put){
    				obj_del(tmp, at.get);
    			}
    			if(tmp = at.soul){
    				obj_del(cat.root.graph, tmp);
    			}
    			if(tmp = at.map){
    				obj_map(tmp, function(at){
    					if(at.link){
    						cat.root.$.get(at.link).off();
    					}
    				});
    			}
    			if(tmp = at.next){
    				obj_map(tmp, function(neat){
    					neat.$.off();
    				});
    			}
    			at.on('off', {});
    			return gun;
    		};
    		var obj = Gun.obj, obj_map = obj.map, obj_has = obj.has, obj_del = obj.del, obj_to = obj.to;
    		var rel = Gun.val.link;
    		var noop = function(){}, u;
    	})(USE, './on');
    USE(function(module){
    		var Gun = USE('./index');
    		Gun.chain.map = function(cb, opt, t){
    			var gun = this, cat = gun._, chain;
    			if(!cb){
    				if(chain = cat.each){ return chain }
    				cat.each = chain = gun.chain();
    				chain._.nix = gun.back('nix');
    				gun.on('in', map, chain._);
    				return chain;
    			}
    			Gun.log.once("mapfn", "Map functions are experimental, their behavior and API may change moving forward. Please play with it and report bugs and ideas on how to improve it.");
    			chain = gun.chain();
    			gun.map().on(function(data, key, at, ev){
    				var next = (cb||noop).call(this, data, key, at, ev);
    				if(u === next){ return }
    				if(data === next){ return chain._.on('in', at) }
    				if(Gun.is(next)){ return chain._.on('in', next._) }
    				chain._.on('in', {get: key, put: next});
    			});
    			return chain;
    		};
    		function map(msg){
    			if(!msg.put || Gun.val.is(msg.put)){ return this.to.next(msg) }
    			if(this.as.nix){ this.off(); } // TODO: Ugly hack!
    			obj_map(msg.put, each, {at: this.as, msg: msg});
    			this.to.next(msg);
    		}
    		function each(v,k){
    			if(n_ === k){ return }
    			var msg = this.msg, gun = msg.$, at = gun._, cat = this.at, tmp = at.lex;
    			if(tmp && !Gun.text.match(k, tmp['.'] || tmp['#'] || tmp)){ return } // review?
    			((tmp = gun.get(k)._).echo || (tmp.echo = {}))[cat.id] = tmp.echo[cat.id] || cat;
    		}
    		var obj_map = Gun.obj.map, noop = function(){}, n_ = Gun.node._, u;
    	})(USE, './map');
    USE(function(module){
    		var Gun = USE('./index');
    		Gun.chain.set = function(item, cb, opt){
    			var gun = this, soul;
    			cb = cb || function(){};
    			opt = opt || {}; opt.item = opt.item || item;
    			if(soul = Gun.node.soul(item)){ item = Gun.obj.put({}, soul, Gun.val.link.ify(soul)); }
    			if(!Gun.is(item)){
    				if(Gun.obj.is(item)){					item = gun.back(-1).get(soul = soul || Gun.node.soul(item) || gun.back('opt.uuid')()).put(item);
    				}
    				return gun.get(soul || (Gun.state.lex() + Gun.text.random(7))).put(item, cb, opt);
    			}
    			item.get(function(soul, o, msg){
    				if(!soul){ return cb.call(gun, {err: Gun.log('Only a node can be linked! Not "' + msg.put + '"!')}) }
    				gun.put(Gun.obj.put({}, soul, Gun.val.link.ify(soul)), cb, opt);
    			},true);
    			return item;
    		};
    	})(USE, './set');
    USE(function(module){
    		if(typeof Gun === 'undefined'){ return } // TODO: localStorage is Browser only. But it would be nice if it could somehow plugin into NodeJS compatible localStorage APIs?

    		var noop = function(){}, store;
    		try{store = (Gun.window||noop).localStorage;}catch(e){}
    		if(!store){
    			Gun.log("Warning: No localStorage exists to persist data to!");
    			store = {setItem: function(k,v){this[k]=v;}, removeItem: function(k){delete this[k];}, getItem: function(k){return this[k]}};
    		}
    		/*
    			NOTE: Both `lib/file.js` and `lib/memdisk.js` are based on this design!
    			If you update anything here, consider updating the other adapters as well.
    		*/

    		Gun.on('create', function(root){
    			// This code is used to queue offline writes for resync.
    			// See the next 'opt' code below for actual saving of data.
    			var ev = this.to, opt = root.opt;
    			if(root.once){ return ev.next(root) }
    			if(false === opt.localStorage){ return ev.next(root) } // we want offline resynce queue regardless! // actually, this doesn't help, per @go1dfish 's observation. Disabling for now, will need better solution later.
    			opt.prefix = opt.file || 'gun/';
    			var gap = Gun.obj.ify(store.getItem('gap/'+opt.prefix)) || {};
    			var empty = Gun.obj.empty, id, to;
    			// add re-sync command.
    			if(!empty(gap)){
    				var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {}, send = {};
    				Gun.obj.map(gap, function(node, soul){
    					Gun.obj.map(node, function(val, key){
    						send[soul] = Gun.state.to(disk[soul], key, send[soul]);
    					});
    				});
    				setTimeout(function(){
    					// TODO: Holy Grail dangling by this thread! If gap / offline resync doesn't trigger, it doesn't work. Ouch, and this is a localStorage specific adapter. :(
    					root.on('out', {put: send, '#': root.ask(ack)});
    				},1);
    			}

    			root.on('out', function(msg){
    				if(msg.lS){ return } // TODO: for IndexedDB and others, shouldn't send to peers ACKs to our own GETs.
    				if(Gun.is(msg.$) && msg.put && !msg['@']){
    					id = msg['#'];
    					Gun.graph.is(msg.put, null, map);
    					if(!to){ to = setTimeout(flush, opt.wait || 1); }
    				}
    				this.to.next(msg);
    			});
    			root.on('ack', ack);

    			function ack(ack){ // TODO: This is experimental, not sure if we should keep this type of event hook.
    				if(ack.err || !ack.ok){ return }
    				var id = ack['@'];
    				setTimeout(function(){
    					Gun.obj.map(gap, function(node, soul){
    						Gun.obj.map(node, function(val, key){
    							if(id !== val){ return }
    							delete node[key];
    						});
    						if(empty(node)){
    							delete gap[soul];
    						}
    					});
    					flush();
    				}, opt.wait || 1);
    			}			ev.next(root);

    			var map = function(val, key, node, soul){
    				(gap[soul] || (gap[soul] = {}))[key] = id;
    			};
    			var flush = function(){
    				clearTimeout(to);
    				to = false;
    				try{store.setItem('gap/'+opt.prefix, JSON.stringify(gap));
    				}catch(e){ Gun.log(err = e || "localStorage failure"); }
    			};
    		});

    		Gun.on('create', function(root){
    			this.to.next(root);
    			var opt = root.opt;
    			if(root.once){ return }
    			if(false === opt.localStorage){ return }
    			opt.prefix = opt.file || 'gun/';
    			var graph = root.graph, acks = {}, count = 0, to;
    			var disk = Gun.obj.ify(store.getItem(opt.prefix)) || {};
    			root.on('localStorage', disk); // NON-STANDARD EVENT!

    			root.on('put', function(at){
    				this.to.next(at);
    				Gun.graph.is(at.put, null, map);
    				if(!at['@']){ acks[at['#']] = true; } // only ack non-acks.
    				count += 1;
    				if(count >= (opt.batch || 1000)){
    					return flush();
    				}
    				if(to){ return }
    				to = setTimeout(flush, opt.wait || 1);
    			});

    			root.on('get', function(msg){
    				this.to.next(msg);
    				var lex = msg.get, soul, data, u;
    				function to(){
    				if(!lex || !(soul = lex['#'])){ return }
    				//if(0 >= msg.cap){ return }
    				var has = lex['.'];
    				data = disk[soul] || u;
    				if(data && has){
    					data = Gun.state.to(data, has);
    				}
    				//if(!data && !Gun.obj.empty(opt.peers)){ return } // if data not found, don't ack if there are peers. // Hmm, what if we have peers but we are disconnected?
    				root.on('in', {'@': msg['#'], put: Gun.graph.node(data), how: 'lS', lS: msg.$});// || root.$});
    				}				Gun.debug? setTimeout(to,1) : to();
    			});

    			var map = function(val, key, node, soul){
    				disk[soul] = Gun.state.to(node, key, disk[soul]);
    			};

    			var flush = function(data){
    				var err;
    				count = 0;
    				clearTimeout(to);
    				to = false;
    				var ack = acks;
    				acks = {};
    				if(data){ disk = data; }
    				try{store.setItem(opt.prefix, JSON.stringify(disk));
    				}catch(e){
    					Gun.log(err = (e || "localStorage failure") + " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install");
    					root.on('localStorage:error', {err: err, file: opt.prefix, flush: disk, retry: flush});
    				}
    				if(!err && !Gun.obj.empty(opt.peers)){ return } // only ack if there are no peers.
    				Gun.obj.map(ack, function(yes, id){
    					root.on('in', {
    						'@': id,
    						err: err,
    						ok: 0 // localStorage isn't reliable, so make its `ok` code be a low number.
    					});
    				});
    			};
    		});
    	})(USE, './adapters/localStorage');
    USE(function(module){
    		var Type = USE('../type');
    		var puff = (typeof setImmediate !== "undefined")? setImmediate : setTimeout;

    		function Mesh(root){
    			var mesh = function(){};
    			var opt = root.opt || {};
    			opt.log = opt.log || console.log;
    			opt.gap = opt.gap || opt.wait || 1;
    			opt.pack = opt.pack || (opt.memory? (opt.memory * 1000 * 1000) : 1399000000) * 0.3; // max_old_space_size defaults to 1400 MB.

    			var dup = root.dup;

    			// TODO: somewhere in here caused a out-of-memory crash! How? It is inbound!
    			mesh.hear = function(raw, peer){
    				if(!raw){ return }
    				var msg, id, hash, tmp = raw[0];
    				if(opt.pack <= raw.length){ return mesh.say({dam: '!', err: "Message too big!"}, peer) }
    				if('{' != raw[2]){ mesh.hear.d += raw.length||0; ++mesh.hear.c; } // STATS! // ugh, stupid double JSON encoding
    				if('[' === tmp){
    					try{msg = JSON.parse(raw);}catch(e){opt.log('DAM JSON parse error', e);}
    					if(!msg){ return }
    					LOG && opt.log(+new Date, msg.length, 'in hear batch');
    					(function go(){
    						var S; LOG && (S = +new Date); // STATS!
    						var m, c = 100; // hardcoded for now?
    						while(c-- && (m = msg.shift())){
    							mesh.hear(m, peer);
    						}
    						LOG && opt.log(S, +new Date - S, 'batch heard');
    						if(!msg.length){ return }
    						puff(go, 0);
    					}());
    					return;
    				}
    				if('{' === tmp || (Type.obj.is(raw) && (msg = raw))){
    					try{msg = msg || JSON.parse(raw);
    					}catch(e){return opt.log('DAM JSON parse error', e)}
    					if(!msg){ return }
    					if(!(id = msg['#'])){ id = msg['#'] = Type.text.random(9); }
    					if(msg.DBG_s){ opt.log(+new Date - msg.DBG_s, 'to hear', id); }
    					if(dup.check(id)){ return }
    					dup.track(id, true).it = it(msg); // GUN core also dedups, so `true` is needed. // Does GUN core need to dedup anymore?
    					if(!(hash = msg['##']) && u !== msg.put){ hash = msg['##'] = Type.obj.hash(msg.put); }
    					if(hash && (tmp = msg['@'] || (msg.get && id))){ // Reduces backward daisy in case varying hashes at different daisy depths are the same.
    						if(dup.check(tmp+hash)){ return }
    						dup.track(tmp+hash, true).it = it(msg); // GUN core also dedups, so `true` is needed. // Does GUN core need to dedup anymore?
    					}
    					(msg._ = function(){}).via = peer;
    					if(tmp = msg['><']){ (msg._).to = Type.obj.map(tmp.split(','), tomap); }
    					if(msg.dam){
    						if(tmp = mesh.hear[msg.dam]){
    							tmp(msg, peer, root);
    						}
    						return;
    					}
    					var S, ST; LOG && (S = +new Date);
    					root.on('in', msg);
    					LOG && !msg.nts && (ST = +new Date - S) > 9 && opt.log(S, ST, 'msg', msg['#']);
    					return;
    				}
    			};
    			var tomap = function(k,i,m){m(k,true);};
    			mesh.hear.c = mesh.hear.d = 0;
    (function(){
    				var SMIA = 0;
    				var message;
    				function each(peer){ mesh.say(message, peer); }
    				mesh.say = function(msg, peer){
    					if(this.to){ this.to.next(msg); } // compatible with middleware adapters.
    					if(!msg){ return false }
    					var id, hash, tmp, raw;
    					var meta = msg._||(msg._=function(){});
    					if(!(id = msg['#'])){ id = msg['#'] = Type.text.random(9); }
    					if(!(hash = msg['##']) && u !== msg.put){ hash = msg['##'] = Type.obj.hash(msg.put); }
    					if(!(raw = meta.raw)){
    						raw = mesh.raw(msg);
    						if(hash && (tmp = msg['@'])){
    							dup.track(tmp+hash).it = it(msg);
    							if(tmp = (dup.s[tmp]||ok).it){
    								if(hash === tmp['##']){ return false }
    								tmp['##'] = hash;
    							}
    						}
    					}
    					//LOG && opt.log(S, +new Date - S, 'say prep');
    					dup.track(id).it = it(msg); // track for 9 seconds, default. Earth<->Mars would need more!
    					if(!peer){ peer = (tmp = dup.s[msg['@']]) && (tmp = tmp.it) && (tmp = tmp._) && (tmp = tmp.via); }
    					if(!peer && msg['@']){
    						LOG && opt.log(+new Date, ++SMIA, 'total no peer to ack to');
    						return false;
    					} // TODO: Temporary? If ack via trace has been lost, acks will go to all peers, which trashes browser bandwidth. Not relaying the ack will force sender to ask for ack again. Note, this is technically wrong for mesh behavior.
    					if(!peer && mesh.way){ return mesh.way(msg) }
    					if(!peer || !peer.id){ message = msg;
    						if(!Type.obj.is(peer || opt.peers)){ return false }
    						//var S; LOG && (S = +new Date);
    						Type.obj.map(peer || opt.peers, each); // in case peer is a peer list.
    						//LOG && opt.log(S, +new Date - S, 'say loop');
    						return;
    					}
    					if(!peer.wire && mesh.wire){ mesh.wire(peer); }
    					if(id === peer.last){ return } peer.last = id;  // was it just sent?
    					if(peer === meta.via){ return false }
    					if((tmp = meta.to) && (tmp[peer.url] || tmp[peer.pid] || tmp[peer.id]) /*&& !o*/){ return false }
    					if(peer.batch){
    						peer.tail = (tmp = peer.tail || 0) + raw.length;
    						if(peer.tail <= opt.pack){
    							peer.batch.push(raw); // peer.batch += (tmp?'':',')+raw; // TODO: Prevent double JSON! // FOR v1.0 !?
    							return;
    						}
    						flush(peer);
    					}
    					peer.batch = []; // peer.batch = '['; // TODO: Prevent double JSON!
    					setTimeout(function(){flush(peer);}, opt.gap);
    					send(raw, peer);
    				};
    				function flush(peer){
    					var tmp = peer.batch; // var tmp = peer.batch + ']'; // TODO: Prevent double JSON!
    					peer.batch = peer.tail = null;
    					if(!tmp){ return }
    					if(!tmp.length){ return } // if(3 > tmp.length){ return } // TODO: ^
    					var S; LOG && (S = +new Date);
    					try{tmp = (1 === tmp.length? tmp[0] : JSON.stringify(tmp));
    					}catch(e){return opt.log('DAM JSON stringify error', e)}
    					LOG && opt.log(S, +new Date - S, 'say stringify', tmp.length);
    					if(!tmp){ return }
    					send(tmp, peer);
    				}
    				mesh.say.c = mesh.say.d = 0;
    			}());
    			
    			// for now - find better place later.
    			function send(raw, peer){ try{
    				var wire = peer.wire;
    				var S, ST; LOG && (S = +new Date);
    				if(peer.say){
    					peer.say(raw);
    				} else
    				if(wire.send){
    					wire.send(raw);
    				}
    				LOG && (ST = +new Date - S) > 9 && opt.log(S, ST, 'wire send', raw.length);
    				mesh.say.d += raw.length||0; ++mesh.say.c; // STATS!
    			}catch(e){
    				(peer.queue = peer.queue || []).push(raw);
    			}}
    (function(){
    				// TODO: this caused a out-of-memory crash!
    				mesh.raw = function(msg){ // TODO: Clean this up / delete it / move logic out!
    					if(!msg){ return '' }
    					var meta = (msg._) || {}, tmp;
    					if(tmp = meta.raw){ return tmp }
    					if(typeof msg === 'string'){ return msg }
    					if(!msg.dam){
    						var i = 0, to = []; Type.obj.map(opt.peers, function(p){
    							to.push(p.url || p.pid || p.id); if(++i > 3){ return true } // limit server, fast fix, improve later! // For "tower" peer, MUST include 6 surrounding ids. // REDUCED THIS TO 3 for temporary relay peer performance, towers still should list neighbors.
    						}); if(i > 1){ msg['><'] = to.join(); }
    					}
    					var raw = $(msg); // optimize by reusing put = the JSON.stringify from .hash?
    					/*if(u !== put){
    						tmp = raw.indexOf(_, raw.indexOf('put'));
    						raw = raw.slice(0, tmp-1) + put + raw.slice(tmp + _.length + 1);
    						//raw = raw.replace('"'+ _ +'"', put); // NEVER USE THIS! ALSO NEVER DELETE IT TO NOT MAKE SAME MISTAKE! https://github.com/amark/gun/wiki/@$$ Heisenbug
    					}*/
    					if(meta && (raw||'').length < (1000 * 100)){ meta.raw = raw; } // HNPERF: If string too big, don't keep in memory.
    					return raw;
    				};
    				var $ = JSON.stringify;

    			}());

    			mesh.hi = function(peer){
    				var tmp = peer.wire || {};
    				if(peer.id){
    					opt.peers[peer.url || peer.id] = peer;
    				} else {
    					tmp = peer.id = peer.id || Type.text.random(9);
    					mesh.say({dam: '?', pid: root.opt.pid}, opt.peers[tmp] = peer);
    					delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
    				}
    				peer.met = peer.met || +(new Date);
    				if(!tmp.hied){ root.on(tmp.hied = 'hi', peer); }
    				// @rogowski I need this here by default for now to fix go1dfish's bug
    				tmp = peer.queue; peer.queue = [];
    				Type.obj.map(tmp, function(msg){
    					send(msg, peer);
    				});
    			};
    			mesh.bye = function(peer){
    				root.on('bye', peer);
    				var tmp = +(new Date); tmp = (tmp - (peer.met||tmp));
    				mesh.bye.time = ((mesh.bye.time || tmp) + tmp) / 2;
    				LOG = console.LOG; // dirty place to cheaply update LOG settings over time.
    			};
    			mesh.hear['!'] = function(msg, peer){ opt.log('Error:', msg.err); };
    			mesh.hear['?'] = function(msg, peer){
    				if(msg.pid){
    					if(!peer.pid){ peer.pid = msg.pid; }
    					if(msg['@']){ return }
    				}
    				mesh.say({dam: '?', pid: opt.pid, '@': msg['#']}, peer);
    				delete dup.s[peer.last]; // IMPORTANT: see https://gun.eco/docs/DAM#self
    			};

    			root.on('create', function(root){
    				root.opt.pid = root.opt.pid || Type.text.random(9);
    				this.to.next(root);
    				root.on('out', mesh.say);
    			});

    			root.on('bye', function(peer, tmp){
    				peer = opt.peers[peer.id || peer] || peer; 
    				this.to.next(peer);
    				peer.bye? peer.bye() : (tmp = peer.wire) && tmp.close && tmp.close();
    				Type.obj.del(opt.peers, peer.id);
    				peer.wire = null;
    			});

    			var gets = {};
    			root.on('bye', function(peer, tmp){ this.to.next(peer);
    				if(!(tmp = peer.url)){ return } gets[tmp] = true;
    				setTimeout(function(){ delete gets[tmp]; },opt.lack || 9000);
    			});
    			root.on('hi', function(peer, tmp){ this.to.next(peer);
    				if(!(tmp = peer.url) || !gets[tmp]){ return } delete gets[tmp];
    				Type.obj.map(root.next, function(node, soul){
    					tmp = {}; tmp[soul] = root.graph[soul];
    					mesh.say({'##': Type.obj.hash(tmp), get: {'#': soul}}, peer);
    				});
    			});

    			return mesh;
    		}
    (function(){
    			Type.text.hash = function(s){ // via SO
    				if(typeof s !== 'string'){ return {err: 1} }
    		    var c = 0;
    		    if(!s.length){ return c }
    		    for(var i=0,l=s.length,n; i<l; ++i){
    		      n = s.charCodeAt(i);
    		      c = ((c<<5)-c)+n;
    		      c |= 0;
    		    }
    		    return c; // Math.abs(c);
    		  };
    			
    			var $ = JSON.stringify, u;

    			Type.obj.hash = function(obj, hash){
    				if(!hash && u === (obj = $(obj, sort))){ return }
    				return Type.text.hash(hash || obj || '');
    			};

    			function sort(k, v){ var tmp;
    				if(!(v instanceof Object)){ return v }
    				Type.obj.map(Object.keys(v).sort(), map, {to: tmp = {}, on: v});
    				return tmp;
    			}
    			Type.obj.hash.sort = sort;

    			function map(k){
    				this.to[k] = this.on[k];
    			}
    		}());

    		function it(msg){ return msg || {_: msg._, '##': msg['##']} } // HNPERF: Only need some meta data, not full reference (took up too much memory). // HNPERF: Garrrgh! We add meta data to msg over time, copying the object happens to early.

    	  var ok = true, u;
    		var LOG = console.LOG;

    	  try{ module.exports = Mesh; }catch(e){}

    	})(USE, './adapters/mesh');
    USE(function(module){
    		var Gun = USE('../index');
    		Gun.Mesh = USE('./mesh');

    		Gun.on('opt', function(root){
    			this.to.next(root);
    			var opt = root.opt;
    			if(root.once){ return }
    			if(false === opt.WebSocket){ return }

    			var env;
    			if(typeof window !== "undefined"){ env = window; }
    			if(typeof commonjsGlobal !== "undefined"){ env = commonjsGlobal; }
    			env = env || {};

    			var websocket = opt.WebSocket || env.WebSocket || env.webkitWebSocket || env.mozWebSocket;
    			if(!websocket){ return }
    			opt.WebSocket = websocket;

    			var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);

    			var wire = mesh.wire || opt.wire;
    			mesh.wire = opt.wire = open;
    			function open(peer){ try{
    				if(!peer || !peer.url){ return wire && wire(peer) }
    				var url = peer.url.replace('http', 'ws');
    				var wire = peer.wire = new opt.WebSocket(url);
    				wire.onclose = function(){
    					opt.mesh.bye(peer);
    					reconnect(peer);
    				};
    				wire.onerror = function(error){
    					reconnect(peer);
    				};
    				wire.onopen = function(){
    					opt.mesh.hi(peer);
    				};
    				wire.onmessage = function(msg){
    					if(!msg){ return }
    					opt.mesh.hear(msg.data || msg, peer);
    				};
    				return wire;
    			}catch(e){}}

    			setTimeout(function(){ root.on('out', {dam:'hi'}); },1); // it can take a while to open a socket, so maybe no longer lazy load for perf reasons?

    			var wait = 2 * 1000;
    			function reconnect(peer){
    				clearTimeout(peer.defer);
    				if(doc && peer.retry <= 0){ return } peer.retry = (peer.retry || opt.retry || 60) - 1;
    				peer.defer = setTimeout(function to(){
    					if(doc && doc.hidden){ return setTimeout(to,wait) }
    					open(peer);
    				}, wait);
    			}
    			var doc = 'undefined' !== typeof document && document;
    		});
    	})(USE, './adapters/websocket');

    }());
    });

    (function(){
    	var Gun = (typeof window !== "undefined")? window.Gun : gun;

    	Gun.on('opt', function(root){
    		this.to.next(root);
    		var opt = root.opt;
    		if(root.once){ return }
    		if(!Gun.Mesh){ return }
    		if(false === opt.RTCPeerConnection){ return }

    		var env;
    		if(typeof window !== "undefined"){ env = window; }
    		if(typeof commonjsGlobal !== "undefined"){ env = commonjsGlobal; }
    		env = env || {};

    		var rtcpc = opt.RTCPeerConnection || env.RTCPeerConnection || env.webkitRTCPeerConnection || env.mozRTCPeerConnection;
    		var rtcsd = opt.RTCSessionDescription || env.RTCSessionDescription || env.webkitRTCSessionDescription || env.mozRTCSessionDescription;
    		var rtcic = opt.RTCIceCandidate || env.RTCIceCandidate || env.webkitRTCIceCandidate || env.mozRTCIceCandidate;
    		if(!rtcpc || !rtcsd || !rtcic){ return }
    		opt.RTCPeerConnection = rtcpc;
    		opt.RTCSessionDescription = rtcsd;
    		opt.RTCIceCandidate = rtcic;
    		opt.rtc = opt.rtc || {'iceServers': [
          {url: 'stun:stun.l.google.com:19302'},
          {url: "stun:stun.sipgate.net:3478"},
          {url: "stun:stun.stunprotocol.org"},
          {url: "stun:stun.sipgate.net:10000"},
          {url: "stun:217.10.68.152:10000"},
          {url: 'stun:stun.services.mozilla.com'} 
        ]};
        opt.rtc.dataChannel = opt.rtc.dataChannel || {ordered: false, maxRetransmits: 2};
        opt.rtc.sdp = opt.rtc.sdp || {mandatory: {OfferToReceiveAudio: false, OfferToReceiveVideo: false}};
        opt.announce = function(to){
    			root.on('out', {rtc: {id: opt.pid, to:to}}); // announce ourself
        };
    		var mesh = opt.mesh = opt.mesh || Gun.Mesh(root);
    		root.on('create', function(at){
    			this.to.next(at);
    			setTimeout(opt.announce, 1);
    		});
    		root.on('in', function(msg){
    			if(msg.rtc){ open(msg); }
    			this.to.next(msg);
    		});

    		function open(msg){
    			var rtc = msg.rtc, peer, tmp;
    			if(!rtc || !rtc.id){ return }
    			delete opt.announce[rtc.id]; /// remove after connect
    			if(tmp = rtc.answer){
    				if(!(peer = opt.peers[rtc.id] || open[rtc.id]) || peer.remoteSet){ return }
    				return peer.setRemoteDescription(peer.remoteSet = new opt.RTCSessionDescription(tmp)); 
    			}
    			if(tmp = rtc.candidate){
    				peer = opt.peers[rtc.id] || open[rtc.id] || open({rtc: {id: rtc.id}});
    				return peer.addIceCandidate(new opt.RTCIceCandidate(tmp));
    			}
    			//if(opt.peers[rtc.id]){ return }
    			if(open[rtc.id]){ return }
    			(peer = new opt.RTCPeerConnection(opt.rtc)).id = rtc.id;
    			var wire = peer.wire = peer.createDataChannel('dc', opt.rtc.dataChannel);
    			open[rtc.id] = peer;
    			wire.onclose = function(){
    				delete open[rtc.id];
    				mesh.bye(peer);
    				//reconnect(peer);
    			};
    			wire.onerror = function(err){};
    			wire.onopen = function(e){
    				//delete open[rtc.id];
    				mesh.hi(peer);
    			};
    			wire.onmessage = function(msg){
    				if(!msg){ return }
    				mesh.hear(msg.data || msg, peer);
    			};
    			peer.onicecandidate = function(e){ // source: EasyRTC!
            if(!e.candidate){ return }
            root.on('out', {'@': msg['#'], rtc: {candidate: e.candidate, id: opt.pid}});
    			};
    			peer.ondatachannel = function(e){
    				var rc = e.channel;
    				rc.onmessage = wire.onmessage;
    				rc.onopen = wire.onopen;
    				rc.onclose = wire.onclose;
    			};
    			if(tmp = rtc.offer){
    				peer.setRemoteDescription(new opt.RTCSessionDescription(tmp)); 
    				peer.createAnswer(function(answer){
    					peer.setLocalDescription(answer);
    					root.on('out', {'@': msg['#'], rtc: {answer: answer, id: opt.pid}});
    				}, function(){}, opt.rtc.sdp);
    				return;
    			}
    			peer.createOffer(function(offer){
    				peer.setLocalDescription(offer);
    				root.on('out', {'@': msg['#'], rtc: {offer: offer, id: opt.pid}});
    			}, function(){}, opt.rtc.sdp);
    			return peer;
    		}
    	});
    }());

    let peers;

    {
      peers = ["http://localhost:8765/gun"];
    }

    const gun$1 = new gun({
      peers,
    });

    // attaching gun to window for testing purposes
    window.gun = gun$1;

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    /* src/ScrollToBottom.svelte generated by Svelte v3.21.0 */
    const file = "src/ScrollToBottom.svelte";

    function create_fragment(ctx) {
    	let div;
    	let button;
    	let div_intro;
    	let div_outro;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "↓";
    			attr_dev(button, "class", "svelte-1co9mdl");
    			add_location(button, file, 6, 2, 163);
    			attr_dev(div, "class", "svelte-1co9mdl");
    			add_location(div, file, 5, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			current = true;
    			if (remount) dispose();

    			dispose = listen_dev(
    				button,
    				"click",
    				prevent_default(function () {
    					if (is_function(/*onScroll*/ ctx[0])) /*onScroll*/ ctx[0].apply(this, arguments);
    				}),
    				false,
    				true,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { x: 20, duration: 200 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fly, { x: 20, duration: 200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { onScroll } = $$props;
    	const writable_props = ["onScroll"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScrollToBottom> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ScrollToBottom", $$slots, []);

    	$$self.$set = $$props => {
    		if ("onScroll" in $$props) $$invalidate(0, onScroll = $$props.onScroll);
    	};

    	$$self.$capture_state = () => ({ fly, onScroll });

    	$$self.$inject_state = $$props => {
    		if ("onScroll" in $$props) $$invalidate(0, onScroll = $$props.onScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onScroll];
    }

    class ScrollToBottom extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { onScroll: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScrollToBottom",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onScroll*/ ctx[0] === undefined && !("onScroll" in props)) {
    			console.warn("<ScrollToBottom> was created without expected prop 'onScroll'");
    		}
    	}

    	get onScroll() {
    		throw new Error("<ScrollToBottom>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onScroll(value) {
    		throw new Error("<ScrollToBottom>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/Input.svelte generated by Svelte v3.21.0 */
    const file$1 = "src/ui/Input.svelte";

    // (57:2) {:else}
    function create_else_block(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			input.disabled = /*disabled*/ ctx[6];
    			attr_dev(input, "rows", /*rows*/ ctx[8]);
    			attr_dev(input, "class", "input svelte-c4fbvv");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", /*maxLength*/ ctx[5]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			attr_dev(input, "aria-labelledby", /*ariaLabelledBy*/ ctx[1]);
    			attr_dev(input, "aria-label", /*ariaLabel*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
    			add_location(input, file$1, 57, 4, 1562);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[12]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*disabled*/ 64) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (dirty & /*rows*/ 256) {
    				attr_dev(input, "rows", /*rows*/ ctx[8]);
    			}

    			if (dirty & /*maxLength*/ 32) {
    				attr_dev(input, "maxlength", /*maxLength*/ ctx[5]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(input, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*ariaLabelledBy*/ 2) {
    				attr_dev(input, "aria-labelledby", /*ariaLabelledBy*/ ctx[1]);
    			}

    			if (dirty & /*ariaLabel*/ 4) {
    				attr_dev(input, "aria-label", /*ariaLabel*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(57:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#if multiline}
    function create_if_block_1(ctx) {
    	let textarea;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.disabled = /*disabled*/ ctx[6];
    			attr_dev(textarea, "rows", /*rows*/ ctx[8]);
    			attr_dev(textarea, "class", "input svelte-c4fbvv");
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "maxlength", /*maxLength*/ ctx[5]);
    			attr_dev(textarea, "name", /*name*/ ctx[4]);
    			attr_dev(textarea, "aria-labelledby", /*ariaLabelledBy*/ ctx[1]);
    			attr_dev(textarea, "aria-label", /*ariaLabel*/ ctx[2]);
    			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[3]);
    			add_location(textarea, file$1, 43, 4, 1292);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    				listen_dev(textarea, "keypress", handleKeyPress, false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*disabled*/ 64) {
    				prop_dev(textarea, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (dirty & /*rows*/ 256) {
    				attr_dev(textarea, "rows", /*rows*/ ctx[8]);
    			}

    			if (dirty & /*maxLength*/ 32) {
    				attr_dev(textarea, "maxlength", /*maxLength*/ ctx[5]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(textarea, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*ariaLabelledBy*/ 2) {
    				attr_dev(textarea, "aria-labelledby", /*ariaLabelledBy*/ ctx[1]);
    			}

    			if (dirty & /*ariaLabel*/ 4) {
    				attr_dev(textarea, "aria-label", /*ariaLabel*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr_dev(textarea, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(43:2) {#if multiline}",
    		ctx
    	});

    	return block;
    }

    // (71:2) {#if value}
    function create_if_block(ctx) {
    	let input;
    	let input_intro;
    	let input_outro;
    	let current;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "submit svelte-c4fbvv");
    			attr_dev(input, "type", "submit");
    			input.value = "Send";
    			add_location(input, file$1, 71, 4, 1806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (input_outro) input_outro.end(1);
    				if (!input_intro) input_intro = create_in_transition(input, fade, {});
    				input_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (input_intro) input_intro.invalidate();
    			input_outro = create_out_transition(input, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching && input_outro) input_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(71:2) {#if value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*multiline*/ ctx[7]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*value*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "input-with-button svelte-c4fbvv");
    			add_location(div, file$1, 41, 0, 1238);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			}

    			if (/*value*/ ctx[0]) {
    				if (if_block1) {
    					if (dirty & /*value*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const CHARS_PER_LINE = 40;

    function handleKeyPress(e) {
    	if (e.which === 13 && !e.shiftKey) {
    		// simulate actual submit event when user pressed return
    		// but not on 'soft return'
    		e.target.form.dispatchEvent(new Event("submit", { cancelable: true }));

    		e.preventDefault();
    	}
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { ariaLabelledBy = null } = $$props;
    	let { ariaLabel = null } = $$props;
    	let { placeholder = null } = $$props;
    	let { value = "" } = $$props;
    	let { name = null } = $$props;
    	let { maxLength = 160 } = $$props;
    	let { maxRows = 1 } = $$props;
    	let { disabled = false } = $$props;
    	let { multiline = false } = $$props;

    	function calcRows(v) {
    		let textRows = Math.floor(v.length / CHARS_PER_LINE) + 1;
    		const numberOfReturns = (v.match(/\n/g) || []).length;
    		textRows += numberOfReturns;
    		return Math.min(maxRows, textRows);
    	}

    	const writable_props = [
    		"ariaLabelledBy",
    		"ariaLabel",
    		"placeholder",
    		"value",
    		"name",
    		"maxLength",
    		"maxRows",
    		"disabled",
    		"multiline"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Input", $$slots, []);

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("ariaLabelledBy" in $$props) $$invalidate(1, ariaLabelledBy = $$props.ariaLabelledBy);
    		if ("ariaLabel" in $$props) $$invalidate(2, ariaLabel = $$props.ariaLabel);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("maxLength" in $$props) $$invalidate(5, maxLength = $$props.maxLength);
    		if ("maxRows" in $$props) $$invalidate(9, maxRows = $$props.maxRows);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(7, multiline = $$props.multiline);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		ariaLabelledBy,
    		ariaLabel,
    		placeholder,
    		value,
    		name,
    		maxLength,
    		maxRows,
    		disabled,
    		multiline,
    		CHARS_PER_LINE,
    		calcRows,
    		handleKeyPress,
    		rows
    	});

    	$$self.$inject_state = $$props => {
    		if ("ariaLabelledBy" in $$props) $$invalidate(1, ariaLabelledBy = $$props.ariaLabelledBy);
    		if ("ariaLabel" in $$props) $$invalidate(2, ariaLabel = $$props.ariaLabel);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("maxLength" in $$props) $$invalidate(5, maxLength = $$props.maxLength);
    		if ("maxRows" in $$props) $$invalidate(9, maxRows = $$props.maxRows);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(7, multiline = $$props.multiline);
    		if ("rows" in $$props) $$invalidate(8, rows = $$props.rows);
    	};

    	let rows;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			 $$invalidate(8, rows = calcRows(value));
    		}
    	};

    	return [
    		value,
    		ariaLabelledBy,
    		ariaLabel,
    		placeholder,
    		name,
    		maxLength,
    		disabled,
    		multiline,
    		rows,
    		maxRows,
    		calcRows,
    		textarea_input_handler,
    		input_input_handler
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			ariaLabelledBy: 1,
    			ariaLabel: 2,
    			placeholder: 3,
    			value: 0,
    			name: 4,
    			maxLength: 5,
    			maxRows: 9,
    			disabled: 6,
    			multiline: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get ariaLabelledBy() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabelledBy(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabel() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabel(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxLength() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxLength(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxRows() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxRows(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MessageInput.svelte generated by Svelte v3.21.0 */
    const file$2 = "src/MessageInput.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let form;
    	let updating_value;
    	let current;
    	let dispose;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[3].call(null, value);
    	}

    	let input_props = {
    		multiline: true,
    		disabled: !/*$user*/ ctx[1],
    		maxRows: 3,
    		name: "msg",
    		placeholder: "Message",
    		ariaLabel: "Message"
    	};

    	if (/*msgInput*/ ctx[0] !== void 0) {
    		input_props.value = /*msgInput*/ ctx[0];
    	}

    	const input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			create_component(input.$$.fragment);
    			attr_dev(form, "method", "get");
    			attr_dev(form, "autocomplete", "off");
    			attr_dev(form, "class", "svelte-1djjhy7");
    			add_location(form, file$2, 11, 2, 256);
    			attr_dev(div, "class", "svelte-1djjhy7");
    			add_location(div, file$2, 10, 0, 248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			mount_component(input, form, null);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[4]), false, true, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};
    			if (dirty & /*$user*/ 2) input_changes.disabled = !/*$user*/ ctx[1];

    			if (!updating_value && dirty & /*msgInput*/ 1) {
    				updating_value = true;
    				input_changes.value = /*msgInput*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	const dispatch = createEventDispatcher();
    	let msgInput;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MessageInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MessageInput", $$slots, []);

    	function input_value_binding(value) {
    		msgInput = value;
    		$$invalidate(0, msgInput);
    	}

    	const submit_handler = e => {
    		if (!msgInput || !msgInput.trim()) return;
    		dispatch("message", msgInput);
    		$$invalidate(0, msgInput = "");
    		e.target.msg.focus();
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		user,
    		Input,
    		gun: gun$1,
    		dispatch,
    		msgInput,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("msgInput" in $$props) $$invalidate(0, msgInput = $$props.msgInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [msgInput, $user, dispatch, input_value_binding, submit_handler];
    }

    class MessageInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MessageInput",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function toHSL(str) {
      if (!str) return;
      const opts = {
        hue: [60, 360],
        sat: [75, 100],
        lum: [70, 71],
      };

      function range(hash, min, max) {
        const diff = max - min;
        const x = ((hash % diff) + diff) % diff;
        return x + min;
      }

      let hash = 0;
      if (str === 0) return hash;

      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
      }

      let h = range(hash, opts.hue[0], opts.hue[1]);
      let s = range(hash, opts.sat[0], opts.sat[1]);
      let l = range(hash, opts.lum[0], opts.lum[1]);

      return `hsl(${h}, ${s}%, ${l}%)`;
    }

    /* src/MessageList.svelte generated by Svelte v3.21.0 */
    const file$3 = "src/MessageList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (32:0) {#each chats as chat (chat.msgId)}
    function create_each_block(key_1, ctx) {
    	let article;
    	let div0;
    	let span0;
    	let t0_value = new Date(parseFloat(/*chat*/ ctx[5].time)).toLocaleString("en-US", { hour12: false }) + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*chat*/ ctx[5].user + "";
    	let t2;
    	let t3;
    	let div1;
    	let t4_value = /*chat*/ ctx[5].msg + "";
    	let t4;
    	let t5;
    	let article_intro;
    	let article_outro;
    	let current;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(span0, "class", "time");
    			add_location(span0, file$3, 38, 6, 933);
    			attr_dev(span1, "class", "user svelte-n2su4y");
    			add_location(span1, file$3, 43, 6, 1077);
    			attr_dev(div0, "class", "meta svelte-n2su4y");
    			add_location(div0, file$3, 37, 4, 908);
    			attr_dev(div1, "class", "msg svelte-n2su4y");
    			set_style(div1, "background-color", /*chat*/ ctx[5].user !== /*$user*/ ctx[1] && toHSL(/*chat*/ ctx[5].user));
    			add_location(div1, file$3, 45, 4, 1130);
    			attr_dev(article, "class", "svelte-n2su4y");
    			toggle_class(article, "user", /*chat*/ ctx[5].user === /*$user*/ ctx[1]);
    			add_location(article, file$3, 32, 2, 807);
    			this.first = article;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(article, t3);
    			append_dev(article, div1);
    			append_dev(div1, t4);
    			append_dev(article, t5);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*chats*/ 1) && t0_value !== (t0_value = new Date(parseFloat(/*chat*/ ctx[5].time)).toLocaleString("en-US", { hour12: false }) + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*chats*/ 1) && t2_value !== (t2_value = /*chat*/ ctx[5].user + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*chats*/ 1) && t4_value !== (t4_value = /*chat*/ ctx[5].msg + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*chats, $user*/ 3) {
    				set_style(div1, "background-color", /*chat*/ ctx[5].user !== /*$user*/ ctx[1] && toHSL(/*chat*/ ctx[5].user));
    			}

    			if (dirty & /*chats, $user*/ 3) {
    				toggle_class(article, "user", /*chat*/ ctx[5].user === /*$user*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (article_outro) article_outro.end(1);
    				if (!article_intro) article_intro = create_in_transition(article, fade, {});
    				article_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (article_intro) article_intro.invalidate();
    			article_outro = create_out_transition(article, /*send*/ ctx[2], { key: /*chat*/ ctx[5].msgId });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (detaching && article_outro) article_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:0) {#each chats as chat (chat.msgId)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*chats*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*chat*/ ctx[5].msgId;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chats, $user, toHSL, Date, parseFloat*/ 3) {
    				const each_value = /*chats*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	const dispatch = createEventDispatcher();
    	let { chats } = $$props;

    	const [send, receive] = crossfade({
    		duration: d => Math.sqrt(d * 200),
    		fallback(node, params) {
    			const style = getComputedStyle(node);
    			const transform = style.transform === "none" ? "" : style.transform;

    			return {
    				duration: 600,
    				easing: quintOut,
    				css: t => `
          transform: ${transform} scale(${t});
          opacity: ${t}
				`
    			};
    		}
    	});

    	const writable_props = ["chats"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MessageList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MessageList", $$slots, []);

    	$$self.$set = $$props => {
    		if ("chats" in $$props) $$invalidate(0, chats = $$props.chats);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		fly,
    		user,
    		quintOut,
    		crossfade,
    		toHSL,
    		dispatch,
    		chats,
    		send,
    		receive,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("chats" in $$props) $$invalidate(0, chats = $$props.chats);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [chats, $user, send];
    }

    class MessageList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { chats: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MessageList",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*chats*/ ctx[0] === undefined && !("chats" in props)) {
    			console.warn("<MessageList> was created without expected prop 'chats'");
    		}
    	}

    	get chats() {
    		throw new Error("<MessageList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chats(value) {
    		throw new Error("<MessageList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/Spinner.svelte generated by Svelte v3.21.0 */

    const file$4 = "src/ui/Spinner.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "loadingspinner");
    			add_location(div0, file$4, 1, 2, 25);
    			attr_dev(div1, "class", "centered");
    			add_location(div1, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", $$slots, []);
    	return [];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Messages.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$5 = "src/Messages.svelte";

    // (103:2) {#if isLoading}
    function create_if_block_1$1(ctx) {
    	let current;
    	const spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(103:2) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (117:0) {#if showScrollToBottom}
    function create_if_block$1(ctx) {
    	let current;

    	const scrolltobottom = new ScrollToBottom({
    			props: { onScroll: /*scrollToBottom*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(scrolltobottom.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scrolltobottom, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrolltobottom.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrolltobottom.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scrolltobottom, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(117:0) {#if showScrollToBottom}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main_1;
    	let t0;
    	let t1;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	let dispose;
    	let if_block0 = /*isLoading*/ ctx[3] && create_if_block_1$1(ctx);

    	const messagelist = new MessageList({
    			props: { chats: /*chats*/ ctx[0] },
    			$$inline: true
    		});

    	const messageinput = new MessageInput({ $$inline: true });
    	messageinput.$on("message", /*message_handler*/ ctx[15]);
    	let if_block1 = /*showScrollToBottom*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main_1 = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			create_component(messagelist.$$.fragment);
    			t1 = space();
    			create_component(messageinput.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty$1();
    			attr_dev(main_1, "class", "svelte-i15h9r");
    			add_location(main_1, file$5, 101, 0, 2888);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, main_1, anchor);
    			if (if_block0) if_block0.m(main_1, null);
    			append_dev(main_1, t0);
    			mount_component(messagelist, main_1, null);
    			/*main_1_binding*/ ctx[14](main_1);
    			insert_dev(target, t1, anchor);
    			mount_component(messageinput, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(main_1, "scroll", /*handleScroll*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isLoading*/ ctx[3]) {
    				if (if_block0) {
    					if (dirty & /*isLoading*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main_1, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const messagelist_changes = {};
    			if (dirty & /*chats*/ 1) messagelist_changes.chats = /*chats*/ ctx[0];
    			messagelist.$set(messagelist_changes);

    			if (/*showScrollToBottom*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showScrollToBottom*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(messagelist.$$.fragment, local);
    			transition_in(messageinput.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(messagelist.$$.fragment, local);
    			transition_out(messageinput.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main_1);
    			if (if_block0) if_block0.d();
    			destroy_component(messagelist);
    			/*main_1_binding*/ ctx[14](null);
    			if (detaching) detach_dev(t1);
    			destroy_component(messageinput, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ADD_ON_SCROLL = 50; // messages to add when scrolling to the top

    function instance$5($$self, $$props, $$invalidate) {
    	let $user;
    	let $chatTopic;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(11, $user = $$value));
    	validate_store(chatTopic, "chatTopic");
    	component_subscribe($$self, chatTopic, $$value => $$invalidate(12, $chatTopic = $$value));
    	let showMessages = 100; // initial messages to load
    	let store = {};
    	let chats = [];
    	let autoscroll;
    	let showScrollToBottom;
    	let main;
    	let isLoading = false;
    	let timeout;

    	function scrollToBottom() {
    		main.scrollTo({ left: 0, top: main.scrollHeight });
    	}

    	function handleScroll(e) {
    		$$invalidate(1, showScrollToBottom = main.scrollHeight - main.offsetHeight > main.scrollTop + 300);

    		if (!isLoading && main.scrollTop <= main.scrollHeight / 10) {
    			const totalMessages = Object.keys(store).length - 1;
    			if (showMessages >= totalMessages) return;
    			$$invalidate(3, isLoading = true);

    			setTimeout(
    				() => {
    					$$invalidate(7, showMessages += ADD_ON_SCROLL);
    					if (main.scrollTop === 0) $$invalidate(2, main.scrollTop = 1, main);
    					$$invalidate(3, isLoading = false);
    				},
    				200
    			);
    		}
    	}

    	function handleNewMessage(msg) {
    		const now = new Date().getTime();
    		const message = { msg, user: $user, time: now };
    		gun$1.get($chatTopic).set(message);
    	}

    	function handleDelete(msgId) {
    		gun$1.get($chatTopic).get(msgId).put(null);
    	}

    	onMount(async () => {
    		gun$1.get($chatTopic).map().on((val, msgId) => {
    			if (val) {
    				$$invalidate(8, store[msgId] = { msgId, ...val }, store);
    			} else {
    				// null messages are deleted
    				delete store[msgId];

    				// reassign store to trigger svelte's reactivity
    				$$invalidate(8, store);
    			}
    		});

    		const arr = Object.values(store);
    		const sorted = arr.sort((a, b) => a.time - b.time);
    		const begin = Math.max(0, sorted.length - showMessages);
    		const end = arr.length;
    		$$invalidate(0, chats = arr.slice(begin, end));
    		console.log(chats);
    	});

    	beforeUpdate(() => {
    		autoscroll = main && main.offsetHeight + main.scrollTop > main.scrollHeight - 50;
    	});

    	afterUpdate(() => {
    		if (autoscroll) main.scrollTo(0, main.scrollHeight);
    	});

    	onDestroy(() => {
    		// remove gun listeners
    		gun$1.get($chatTopic).off();
    	});

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Messages> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Messages", $$slots, []);

    	function main_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, main = $$value);
    		});
    	}

    	const message_handler = e => {
    		console.log(e);
    		handleNewMessage(e.detail);
    		scrollToBottom();
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		onDestroy,
    		chatTopic,
    		user,
    		gun: gun$1,
    		ScrollToBottom,
    		MessageInput,
    		MessageList,
    		Spinner,
    		ADD_ON_SCROLL,
    		showMessages,
    		store,
    		chats,
    		autoscroll,
    		showScrollToBottom,
    		main,
    		isLoading,
    		timeout,
    		scrollToBottom,
    		handleScroll,
    		handleNewMessage,
    		handleDelete,
    		$user,
    		$chatTopic
    	});

    	$$self.$inject_state = $$props => {
    		if ("showMessages" in $$props) $$invalidate(7, showMessages = $$props.showMessages);
    		if ("store" in $$props) $$invalidate(8, store = $$props.store);
    		if ("chats" in $$props) $$invalidate(0, chats = $$props.chats);
    		if ("autoscroll" in $$props) autoscroll = $$props.autoscroll;
    		if ("showScrollToBottom" in $$props) $$invalidate(1, showScrollToBottom = $$props.showScrollToBottom);
    		if ("main" in $$props) $$invalidate(2, main = $$props.main);
    		if ("isLoading" in $$props) $$invalidate(3, isLoading = $$props.isLoading);
    		if ("timeout" in $$props) $$invalidate(10, timeout = $$props.timeout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*timeout, store, showMessages*/ 1408) {
    			 {
    				$$invalidate(3, isLoading = true);
    				if (timeout) clearTimeout(timeout);

    				// debounce update svelte store to avoid overloading ui
    				$$invalidate(10, timeout = setTimeout(
    					() => {
    						// convert key/value object to sorted array of messages (with a max length)
    						const arr = Object.values(store);

    						const sorted = arr.sort((a, b) => a.time - b.time);
    						const begin = Math.max(0, sorted.length - showMessages);
    						const end = arr.length;
    						$$invalidate(0, chats = arr.slice(begin, end));
    						$$invalidate(3, isLoading = false);
    					},
    					200
    				));
    			}
    		}
    	};

    	return [
    		chats,
    		showScrollToBottom,
    		main,
    		isLoading,
    		scrollToBottom,
    		handleScroll,
    		handleNewMessage,
    		showMessages,
    		store,
    		autoscroll,
    		timeout,
    		$user,
    		$chatTopic,
    		handleDelete,
    		main_1_binding,
    		message_handler
    	];
    }

    class Messages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Messages",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/ui/Nav.svelte generated by Svelte v3.21.0 */
    const file$6 = "src/ui/Nav.svelte";

    // (9:2) {#if showBack}
    function create_if_block$2(ctx) {
    	let button;
    	let svg;
    	let path;
    	let t;
    	let dispose;
    	let if_block = /*backText*/ ctx[1] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M13.7 15.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4\n          1.4L10.42 12l3.3 3.3z");
    			add_location(path, file$6, 16, 8, 382);
    			attr_dev(svg, "height", "40");
    			attr_dev(svg, "width", "40");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$6, 10, 6, 251);
    			attr_dev(button, "class", "svelte-gao1x3");
    			add_location(button, file$6, 9, 4, 202);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);
    			append_dev(button, t);
    			if (if_block) if_block.m(button, null);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*backText*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(button, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(9:2) {#if showBack}",
    		ctx
    	});

    	return block;
    }

    // (23:6) {#if backText}
    function create_if_block_1$2(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*backText*/ ctx[1]);
    			attr_dev(span, "class", "svelte-gao1x3");
    			add_location(span, file$6, 23, 8, 585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*backText*/ 2) set_data_dev(t, /*backText*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(23:6) {#if backText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let nav;
    	let t;
    	let h1;
    	let current;
    	let if_block = /*showBack*/ ctx[0] && create_if_block$2(ctx);
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if (if_block) if_block.c();
    			t = space();
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", "svelte-gao1x3");
    			add_location(h1, file$6, 27, 2, 645);
    			attr_dev(nav, "class", "svelte-gao1x3");
    			add_location(nav, file$6, 7, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			if (if_block) if_block.m(nav, null);
    			append_dev(nav, t);
    			append_dev(nav, h1);

    			if (default_slot) {
    				default_slot.m(h1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showBack*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(nav, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { showBack = false } = $$props;
    	let { backText = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ["showBack", "backText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, ['default']);
    	const click_handler = () => dispatch("back");

    	$$self.$set = $$props => {
    		if ("showBack" in $$props) $$invalidate(0, showBack = $$props.showBack);
    		if ("backText" in $$props) $$invalidate(1, backText = $$props.backText);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		showBack,
    		backText,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("showBack" in $$props) $$invalidate(0, showBack = $$props.showBack);
    		if ("backText" in $$props) $$invalidate(1, backText = $$props.backText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showBack, backText, dispatch, $$scope, $$slots, click_handler];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { showBack: 0, backText: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get showBack() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showBack(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backText() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backText(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/Page.svelte generated by Svelte v3.21.0 */
    const file$7 = "src/ui/Page.svelte";

    function create_fragment$7(ctx) {
    	let div1;
    	let div0;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "container svelte-lj276o");
    			add_location(div0, file$7, 5, 2, 107);
    			attr_dev(div1, "class", "animation svelte-lj276o");
    			add_location(div1, file$7, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fade, {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Page", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade });
    	return [$$scope, $$slots];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.21.0 */

    const file$8 = "src/Footer.svelte";

    function create_fragment$8(ctx) {
    	let footer;
    	let t0;
    	let span;
    	let t2;
    	let a0;
    	let t4;
    	let br0;
    	let t5;
    	let a1;
    	let t7;
    	let a2;
    	let t9;
    	let a3;
    	let t11;
    	let br1;
    	let t12;
    	let t13_value = "0.9.0" + "";
    	let t13;
    	let t14;
    	let t15_value = "488f976" + "";
    	let t15;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			t0 = text("Made with\n  ");
    			span = element("span");
    			span.textContent = "♥️";
    			t2 = text("\n  by\n  ");
    			a0 = element("a");
    			a0.textContent = "Koen van Gilst";
    			t4 = space();
    			br0 = element("br");
    			t5 = text("\n  Using\n  ");
    			a1 = element("a");
    			a1.textContent = "svelte";
    			t7 = text("\n  and\n  ");
    			a2 = element("a");
    			a2.textContent = "gunDB";
    			t9 = text("\n  see\n  ");
    			a3 = element("a");
    			a3.textContent = "Github";
    			t11 = space();
    			br1 = element("br");
    			t12 = text("\n  v. ");
    			t13 = text(t13_value);
    			t14 = text(" git ");
    			t15 = text(t15_value);
    			attr_dev(span, "class", "svelte-17ail42");
    			add_location(span, file$8, 2, 2, 23);
    			attr_dev(a0, "href", "https://koenvangilst.nl");
    			add_location(a0, file$8, 4, 2, 46);
    			add_location(br0, file$8, 5, 2, 101);
    			attr_dev(a1, "href", "https://svelte.dev/");
    			add_location(a1, file$8, 7, 2, 118);
    			attr_dev(a2, "href", "https://gun.eco/");
    			add_location(a2, file$8, 9, 2, 167);
    			attr_dev(a3, "href", "https://github.com/vnglst/svelte-gundb-chat");
    			add_location(a3, file$8, 11, 2, 212);
    			add_location(br1, file$8, 12, 2, 279);
    			attr_dev(footer, "class", "svelte-17ail42");
    			add_location(footer, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, t0);
    			append_dev(footer, span);
    			append_dev(footer, t2);
    			append_dev(footer, a0);
    			append_dev(footer, t4);
    			append_dev(footer, br0);
    			append_dev(footer, t5);
    			append_dev(footer, a1);
    			append_dev(footer, t7);
    			append_dev(footer, a2);
    			append_dev(footer, t9);
    			append_dev(footer, a3);
    			append_dev(footer, t11);
    			append_dev(footer, br1);
    			append_dev(footer, t12);
    			append_dev(footer, t13);
    			append_dev(footer, t14);
    			append_dev(footer, t15);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.21.0 */

    // (15:2) <Nav>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Messages");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(15:2) <Nav>",
    		ctx
    	});

    	return block;
    }

    // (14:0) <Page>
    function create_default_slot(ctx) {
    	let t;
    	let current;

    	const nav_1 = new Nav({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const messages = new Messages({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav_1.$$.fragment);
    			t = space();
    			create_component(messages.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav_1, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(messages, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const nav_1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				nav_1_changes.$$scope = { dirty, ctx };
    			}

    			nav_1.$set(nav_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav_1.$$.fragment, local);
    			transition_in(messages.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav_1.$$.fragment, local);
    			transition_out(messages.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav_1, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(messages, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:0) <Page>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current;

    	const page = new Page({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				page_changes.$$scope = { dirty, ctx };
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $user;
    	let $nav;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
    	validate_store(nav, "nav");
    	component_subscribe($$self, nav, $$value => $$invalidate(1, $nav = $$value));

    	onMount(async () => {
    		set_store_value(user, $user = "Amazing");
    		set_store_value(nav, $nav = "messages");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		nav,
    		user,
    		Messages,
    		Nav,
    		Page,
    		Footer,
    		onMount,
    		$user,
    		$nav
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    document.body.innerHTML = "";

    const app = new App({
      target: document.body,
    });
    // Check that service workers are supported
    // only load in production
    if ("serviceWorker" in navigator) {
      // Use the window load event to keep the page load performant
      window.addEventListener("load", () => {

        // remove all old service workers when developing
        {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            console.log("Unloading service workers", registrations);
            for (let registration of registrations) {
              registration.unregister();
            }
          });
        }
      });
    }

    return app;

}());
//# sourceMappingURL=bundle.js.map
