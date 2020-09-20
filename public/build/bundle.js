
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
    function empty() {
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

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
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

    // export const chatTopic = localStorageStore({
    //   storageKey: "chat_topic",
    //   initialValue: "gundb",
    // });

    const user = localStorageStore({ storageKey: "chat_user" });

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

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        if (
          (utils.isBlob(requestData) || utils.isFile(requestData)) &&
          requestData.type
        ) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = unescape(encodeURIComponent(config.auth.password)) || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
      var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
      ];
      var directMergeKeys = ['validateStatus'];

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      }

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
          config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          config[prop] = getMergedValue(undefined, config1[prop]);
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys)
        .concat(directMergeKeys);

      var otherKeys = Object
        .keys(config1)
        .concat(Object.keys(config2))
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, mergeDeepProperties);

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$1(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Factory for creating new instances
    axios$1.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios$1.Cancel = Cancel_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios$2 = axios_1;

    const request = axios$2.create({
      timeout: 5000,
    });
    request.baseUrl = `http://dev.fastsupport.cn/`;
    request.socketUrl = `http://dev.fastsupport.cn:6001/`;

    request.interceptors.request.use(
      async (config) => {
        const baseUrl = request.baseUrl;
        config.baseURL = baseUrl;
        const token = localStorage.getItem("visitor_token");
        if (token) {
          config.headers = {
            Authorization: "Bearer " + token,
          };
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    request.interceptors.response.use(
      (response) => {
        const data = response.data || {};
        if (data.Status !== 200) ;
        return data;
      },
      (err) => {
        const data = err.response.data || {};
        if (data.status === 401 || data.code === 1003) {
          localStorage.removeItem("visitor_token");
        }
        return Promise.reject(err);
      }
    );

    /* src/MessageInput.svelte generated by Svelte v3.21.0 */

    const { console: console_1 } = globals;
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
    			add_location(form, file$2, 39, 2, 759);
    			attr_dev(div, "class", "svelte-1djjhy7");
    			add_location(div, file$2, 38, 0, 751);
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
    	let msgInput;

    	function sendMessage() {
    		const id = localStorage.getItem("conversation_id");

    		if (id) {
    			const { data } = request({
    				url: `api/conversation/${id}/send-message`,
    				method: "POST",
    				data: { type: 1, content: msgInput }
    			});

    			console.log(data);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<MessageInput> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MessageInput", $$slots, []);

    	function input_value_binding(value) {
    		msgInput = value;
    		$$invalidate(0, msgInput);
    	}

    	const submit_handler = e => {
    		if (!msgInput || !msgInput.trim()) return;
    		sendMessage();
    		$$invalidate(0, msgInput = "");
    		e.target.msg.focus();
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		user,
    		Input,
    		request,
    		msgInput,
    		sendMessage,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("msgInput" in $$props) $$invalidate(0, msgInput = $$props.msgInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [msgInput, $user, sendMessage, input_value_binding, submit_handler];
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
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (97:0) {#each chats as chat (chat.id)}
    function create_each_block(key_1, ctx) {
    	let article;
    	let div0;
    	let span0;
    	let t0_value = new Date(parseFloat(/*chat*/ ctx[4].created_at)).toLocaleString("zh-CN", { hour12: false }) + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*chat*/ ctx[4].sender.name + "";
    	let t2;
    	let t3;
    	let div1;
    	let t4_value = /*chat*/ ctx[4].content + "";
    	let t4;
    	let t5;

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
    			add_location(span0, file$3, 99, 6, 2278);
    			attr_dev(span1, "class", "user svelte-n2su4y");
    			add_location(span1, file$3, 104, 6, 2428);
    			attr_dev(div0, "class", "meta svelte-n2su4y");
    			add_location(div0, file$3, 98, 4, 2253);
    			attr_dev(div1, "class", "msg svelte-n2su4y");
    			set_style(div1, "background-color", /*chat*/ ctx[4].user !== /*$user*/ ctx[1] && toHSL(/*chat*/ ctx[4].user));
    			add_location(div1, file$3, 106, 4, 2488);
    			attr_dev(article, "class", "svelte-n2su4y");
    			toggle_class(article, "user", /*chat*/ ctx[4].sender_type_text === "visitor");
    			add_location(article, file$3, 97, 2, 2190);
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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*chats*/ 1 && t0_value !== (t0_value = new Date(parseFloat(/*chat*/ ctx[4].created_at)).toLocaleString("zh-CN", { hour12: false }) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*chats*/ 1 && t2_value !== (t2_value = /*chat*/ ctx[4].sender.name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*chats*/ 1 && t4_value !== (t4_value = /*chat*/ ctx[4].content + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*chats, $user*/ 3) {
    				set_style(div1, "background-color", /*chat*/ ctx[4].user !== /*$user*/ ctx[1] && toHSL(/*chat*/ ctx[4].user));
    			}

    			if (dirty & /*chats*/ 1) {
    				toggle_class(article, "user", /*chat*/ ctx[4].sender_type_text === "visitor");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(97:0) {#each chats as chat (chat.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*chats*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*chat*/ ctx[4].id;
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

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*chats, $user, toHSL, Date, parseFloat*/ 3) {
    				const each_value = /*chats*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block, each_1_anchor, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
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

    	return [chats, $user];
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

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _extends() {
      _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target;
      };

      return _extends.apply(this, arguments);
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

      return _setPrototypeOf(o, p);
    }

    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;

      try {
        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
        return true;
      } catch (e) {
        return false;
      }
    }

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return self;
    }

    function _possibleConstructorReturn(self, call) {
      if (call && (typeof call === "object" || typeof call === "function")) {
        return call;
      }

      return _assertThisInitialized(self);
    }

    function _createSuper(Derived) {
      var hasNativeReflectConstruct = _isNativeReflectConstruct();

      return function () {
        var Super = _getPrototypeOf(Derived),
            result;

        if (hasNativeReflectConstruct) {
          var NewTarget = _getPrototypeOf(this).constructor;

          result = Reflect.construct(Super, arguments, NewTarget);
        } else {
          result = Super.apply(this, arguments);
        }

        return _possibleConstructorReturn(this, result);
      };
    }

    var Connector = /*#__PURE__*/function () {
      /**
       * Create a new class instance.
       */
      function Connector(options) {
        _classCallCheck(this, Connector);

        /**
         * Default connector options.
         */
        this._defaultOptions = {
          auth: {
            headers: {}
          },
          authEndpoint: '/broadcasting/auth',
          broadcaster: 'pusher',
          csrfToken: null,
          host: null,
          key: null,
          namespace: 'App.Events'
        };
        this.setOptions(options);
        this.connect();
      }
      /**
       * Merge the custom options with the defaults.
       */


      _createClass(Connector, [{
        key: "setOptions",
        value: function setOptions(options) {
          this.options = _extends(this._defaultOptions, options);

          if (this.csrfToken()) {
            this.options.auth.headers['X-CSRF-TOKEN'] = this.csrfToken();
          }

          return options;
        }
        /**
         * Extract the CSRF token from the page.
         */

      }, {
        key: "csrfToken",
        value: function csrfToken() {
          var selector;

          if (typeof window !== 'undefined' && window['Laravel'] && window['Laravel'].csrfToken) {
            return window['Laravel'].csrfToken;
          } else if (this.options.csrfToken) {
            return this.options.csrfToken;
          } else if (typeof document !== 'undefined' && typeof document.querySelector === 'function' && (selector = document.querySelector('meta[name="csrf-token"]'))) {
            return selector.getAttribute('content');
          }

          return null;
        }
      }]);

      return Connector;
    }();

    /**
     * This class represents a basic channel.
     */
    var Channel = /*#__PURE__*/function () {
      function Channel() {
        _classCallCheck(this, Channel);
      }

      _createClass(Channel, [{
        key: "listenForWhisper",

        /**
         * Listen for a whisper event on the channel instance.
         */
        value: function listenForWhisper(event, callback) {
          return this.listen('.client-' + event, callback);
        }
        /**
         * Listen for an event on the channel instance.
         */

      }, {
        key: "notification",
        value: function notification(callback) {
          return this.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', callback);
        }
        /**
         * Stop listening for a whisper event on the channel instance.
         */

      }, {
        key: "stopListeningForWhisper",
        value: function stopListeningForWhisper(event) {
          return this.stopListening('.client-' + event);
        }
      }]);

      return Channel;
    }();

    /**
     * Event name formatter
     */
    var EventFormatter = /*#__PURE__*/function () {
      /**
       * Create a new class instance.
       */
      function EventFormatter(namespace) {
        _classCallCheck(this, EventFormatter);

        this.setNamespace(namespace);
      }
      /**
       * Format the given event name.
       */


      _createClass(EventFormatter, [{
        key: "format",
        value: function format(event) {
          if (event.charAt(0) === '.' || event.charAt(0) === '\\') {
            return event.substr(1);
          } else if (this.namespace) {
            event = this.namespace + '.' + event;
          }

          return event.replace(/\./g, '\\');
        }
        /**
         * Set the event namespace.
         */

      }, {
        key: "setNamespace",
        value: function setNamespace(value) {
          this.namespace = value;
        }
      }]);

      return EventFormatter;
    }();

    /**
     * This class represents a Pusher channel.
     */

    var PusherChannel = /*#__PURE__*/function (_Channel) {
      _inherits(PusherChannel, _Channel);

      var _super = _createSuper(PusherChannel);

      /**
       * Create a new class instance.
       */
      function PusherChannel(pusher, name, options) {
        var _this;

        _classCallCheck(this, PusherChannel);

        _this = _super.call(this);
        _this.name = name;
        _this.pusher = pusher;
        _this.options = options;
        _this.eventFormatter = new EventFormatter(_this.options.namespace);

        _this.subscribe();

        return _this;
      }
      /**
       * Subscribe to a Pusher channel.
       */


      _createClass(PusherChannel, [{
        key: "subscribe",
        value: function subscribe() {
          this.subscription = this.pusher.subscribe(this.name);
        }
        /**
         * Unsubscribe from a Pusher channel.
         */

      }, {
        key: "unsubscribe",
        value: function unsubscribe() {
          this.pusher.unsubscribe(this.name);
        }
        /**
         * Listen for an event on the channel instance.
         */

      }, {
        key: "listen",
        value: function listen(event, callback) {
          this.on(this.eventFormatter.format(event), callback);
          return this;
        }
        /**
         * Stop listening for an event on the channel instance.
         */

      }, {
        key: "stopListening",
        value: function stopListening(event) {
          this.subscription.unbind(this.eventFormatter.format(event));
          return this;
        }
        /**
         * Register a callback to be called anytime a subscription error occurs.
         */

      }, {
        key: "error",
        value: function error(callback) {
          this.on('pusher:subscription_error', function (status) {
            callback(status);
          });
          return this;
        }
        /**
         * Bind a channel to an event.
         */

      }, {
        key: "on",
        value: function on(event, callback) {
          this.subscription.bind(event, callback);
          return this;
        }
      }]);

      return PusherChannel;
    }(Channel);

    /**
     * This class represents a Pusher private channel.
     */

    var PusherPrivateChannel = /*#__PURE__*/function (_PusherChannel) {
      _inherits(PusherPrivateChannel, _PusherChannel);

      var _super = _createSuper(PusherPrivateChannel);

      function PusherPrivateChannel() {
        _classCallCheck(this, PusherPrivateChannel);

        return _super.apply(this, arguments);
      }

      _createClass(PusherPrivateChannel, [{
        key: "whisper",

        /**
         * Trigger client event on the channel.
         */
        value: function whisper(eventName, data) {
          this.pusher.channels.channels[this.name].trigger("client-".concat(eventName), data);
          return this;
        }
      }]);

      return PusherPrivateChannel;
    }(PusherChannel);

    /**
     * This class represents a Pusher private channel.
     */

    var PusherEncryptedPrivateChannel = /*#__PURE__*/function (_PusherChannel) {
      _inherits(PusherEncryptedPrivateChannel, _PusherChannel);

      var _super = _createSuper(PusherEncryptedPrivateChannel);

      function PusherEncryptedPrivateChannel() {
        _classCallCheck(this, PusherEncryptedPrivateChannel);

        return _super.apply(this, arguments);
      }

      _createClass(PusherEncryptedPrivateChannel, [{
        key: "whisper",

        /**
         * Trigger client event on the channel.
         */
        value: function whisper(eventName, data) {
          this.pusher.channels.channels[this.name].trigger("client-".concat(eventName), data);
          return this;
        }
      }]);

      return PusherEncryptedPrivateChannel;
    }(PusherChannel);

    /**
     * This class represents a Pusher presence channel.
     */

    var PusherPresenceChannel = /*#__PURE__*/function (_PusherChannel) {
      _inherits(PusherPresenceChannel, _PusherChannel);

      var _super = _createSuper(PusherPresenceChannel);

      function PusherPresenceChannel() {
        _classCallCheck(this, PusherPresenceChannel);

        return _super.apply(this, arguments);
      }

      _createClass(PusherPresenceChannel, [{
        key: "here",

        /**
         * Register a callback to be called anytime the member list changes.
         */
        value: function here(callback) {
          this.on('pusher:subscription_succeeded', function (data) {
            callback(Object.keys(data.members).map(function (k) {
              return data.members[k];
            }));
          });
          return this;
        }
        /**
         * Listen for someone joining the channel.
         */

      }, {
        key: "joining",
        value: function joining(callback) {
          this.on('pusher:member_added', function (member) {
            callback(member.info);
          });
          return this;
        }
        /**
         * Listen for someone leaving the channel.
         */

      }, {
        key: "leaving",
        value: function leaving(callback) {
          this.on('pusher:member_removed', function (member) {
            callback(member.info);
          });
          return this;
        }
        /**
         * Trigger client event on the channel.
         */

      }, {
        key: "whisper",
        value: function whisper(eventName, data) {
          this.pusher.channels.channels[this.name].trigger("client-".concat(eventName), data);
          return this;
        }
      }]);

      return PusherPresenceChannel;
    }(PusherChannel);

    /**
     * This class represents a Socket.io channel.
     */

    var SocketIoChannel = /*#__PURE__*/function (_Channel) {
      _inherits(SocketIoChannel, _Channel);

      var _super = _createSuper(SocketIoChannel);

      /**
       * Create a new class instance.
       */
      function SocketIoChannel(socket, name, options) {
        var _this;

        _classCallCheck(this, SocketIoChannel);

        _this = _super.call(this);
        /**
         * The event callbacks applied to the channel.
         */

        _this.events = {};
        _this.name = name;
        _this.socket = socket;
        _this.options = options;
        _this.eventFormatter = new EventFormatter(_this.options.namespace);

        _this.subscribe();

        _this.configureReconnector();

        return _this;
      }
      /**
       * Subscribe to a Socket.io channel.
       */


      _createClass(SocketIoChannel, [{
        key: "subscribe",
        value: function subscribe() {
          this.socket.emit('subscribe', {
            channel: this.name,
            auth: this.options.auth || {}
          });
        }
        /**
         * Unsubscribe from channel and ubind event callbacks.
         */

      }, {
        key: "unsubscribe",
        value: function unsubscribe() {
          this.unbind();
          this.socket.emit('unsubscribe', {
            channel: this.name,
            auth: this.options.auth || {}
          });
        }
        /**
         * Listen for an event on the channel instance.
         */

      }, {
        key: "listen",
        value: function listen(event, callback) {
          this.on(this.eventFormatter.format(event), callback);
          return this;
        }
        /**
         * Stop listening for an event on the channel instance.
         */

      }, {
        key: "stopListening",
        value: function stopListening(event) {
          var name = this.eventFormatter.format(event);
          this.socket.removeListener(name);
          delete this.events[name];
          return this;
        }
        /**
         * Register a callback to be called anytime an error occurs.
         */

      }, {
        key: "error",
        value: function error(callback) {
          return this;
        }
        /**
         * Bind the channel's socket to an event and store the callback.
         */

      }, {
        key: "on",
        value: function on(event, callback) {
          var _this2 = this;

          var listener = function listener(channel, data) {
            if (_this2.name == channel) {
              callback(data);
            }
          };

          this.socket.on(event, listener);
          this.bind(event, listener);
        }
        /**
         * Attach a 'reconnect' listener and bind the event.
         */

      }, {
        key: "configureReconnector",
        value: function configureReconnector() {
          var _this3 = this;

          var listener = function listener() {
            _this3.subscribe();
          };

          this.socket.on('reconnect', listener);
          this.bind('reconnect', listener);
        }
        /**
         * Bind the channel's socket to an event and store the callback.
         */

      }, {
        key: "bind",
        value: function bind(event, callback) {
          this.events[event] = this.events[event] || [];
          this.events[event].push(callback);
        }
        /**
         * Unbind the channel's socket from all stored event callbacks.
         */

      }, {
        key: "unbind",
        value: function unbind() {
          var _this4 = this;

          Object.keys(this.events).forEach(function (event) {
            _this4.events[event].forEach(function (callback) {
              _this4.socket.removeListener(event, callback);
            });

            delete _this4.events[event];
          });
        }
      }]);

      return SocketIoChannel;
    }(Channel);

    /**
     * This class represents a Socket.io presence channel.
     */

    var SocketIoPrivateChannel = /*#__PURE__*/function (_SocketIoChannel) {
      _inherits(SocketIoPrivateChannel, _SocketIoChannel);

      var _super = _createSuper(SocketIoPrivateChannel);

      function SocketIoPrivateChannel() {
        _classCallCheck(this, SocketIoPrivateChannel);

        return _super.apply(this, arguments);
      }

      _createClass(SocketIoPrivateChannel, [{
        key: "whisper",

        /**
         * Trigger client event on the channel.
         */
        value: function whisper(eventName, data) {
          this.socket.emit('client event', {
            channel: this.name,
            event: "client-".concat(eventName),
            data: data
          });
          return this;
        }
      }]);

      return SocketIoPrivateChannel;
    }(SocketIoChannel);

    /**
     * This class represents a Socket.io presence channel.
     */

    var SocketIoPresenceChannel = /*#__PURE__*/function (_SocketIoPrivateChann) {
      _inherits(SocketIoPresenceChannel, _SocketIoPrivateChann);

      var _super = _createSuper(SocketIoPresenceChannel);

      function SocketIoPresenceChannel() {
        _classCallCheck(this, SocketIoPresenceChannel);

        return _super.apply(this, arguments);
      }

      _createClass(SocketIoPresenceChannel, [{
        key: "here",

        /**
         * Register a callback to be called anytime the member list changes.
         */
        value: function here(callback) {
          this.on('presence:subscribed', function (members) {
            callback(members.map(function (m) {
              return m.user_info;
            }));
          });
          return this;
        }
        /**
         * Listen for someone joining the channel.
         */

      }, {
        key: "joining",
        value: function joining(callback) {
          this.on('presence:joining', function (member) {
            return callback(member.user_info);
          });
          return this;
        }
        /**
         * Listen for someone leaving the channel.
         */

      }, {
        key: "leaving",
        value: function leaving(callback) {
          this.on('presence:leaving', function (member) {
            return callback(member.user_info);
          });
          return this;
        }
      }]);

      return SocketIoPresenceChannel;
    }(SocketIoPrivateChannel);

    /**
     * This class represents a null channel.
     */

    var NullChannel = /*#__PURE__*/function (_Channel) {
      _inherits(NullChannel, _Channel);

      var _super = _createSuper(NullChannel);

      function NullChannel() {
        _classCallCheck(this, NullChannel);

        return _super.apply(this, arguments);
      }

      _createClass(NullChannel, [{
        key: "subscribe",

        /**
         * Subscribe to a channel.
         */
        value: function subscribe() {} //

        /**
         * Unsubscribe from a channel.
         */

      }, {
        key: "unsubscribe",
        value: function unsubscribe() {} //

        /**
         * Listen for an event on the channel instance.
         */

      }, {
        key: "listen",
        value: function listen(event, callback) {
          return this;
        }
        /**
         * Stop listening for an event on the channel instance.
         */

      }, {
        key: "stopListening",
        value: function stopListening(event) {
          return this;
        }
        /**
         * Register a callback to be called anytime an error occurs.
         */

      }, {
        key: "error",
        value: function error(callback) {
          return this;
        }
        /**
         * Bind a channel to an event.
         */

      }, {
        key: "on",
        value: function on(event, callback) {
          return this;
        }
      }]);

      return NullChannel;
    }(Channel);

    /**
     * This class represents a null private channel.
     */

    var NullPrivateChannel = /*#__PURE__*/function (_NullChannel) {
      _inherits(NullPrivateChannel, _NullChannel);

      var _super = _createSuper(NullPrivateChannel);

      function NullPrivateChannel() {
        _classCallCheck(this, NullPrivateChannel);

        return _super.apply(this, arguments);
      }

      _createClass(NullPrivateChannel, [{
        key: "whisper",

        /**
         * Trigger client event on the channel.
         */
        value: function whisper(eventName, data) {
          return this;
        }
      }]);

      return NullPrivateChannel;
    }(NullChannel);

    /**
     * This class represents a null presence channel.
     */

    var NullPresenceChannel = /*#__PURE__*/function (_NullChannel) {
      _inherits(NullPresenceChannel, _NullChannel);

      var _super = _createSuper(NullPresenceChannel);

      function NullPresenceChannel() {
        _classCallCheck(this, NullPresenceChannel);

        return _super.apply(this, arguments);
      }

      _createClass(NullPresenceChannel, [{
        key: "here",

        /**
         * Register a callback to be called anytime the member list changes.
         */
        value: function here(callback) {
          return this;
        }
        /**
         * Listen for someone joining the channel.
         */

      }, {
        key: "joining",
        value: function joining(callback) {
          return this;
        }
        /**
         * Listen for someone leaving the channel.
         */

      }, {
        key: "leaving",
        value: function leaving(callback) {
          return this;
        }
        /**
         * Trigger client event on the channel.
         */

      }, {
        key: "whisper",
        value: function whisper(eventName, data) {
          return this;
        }
      }]);

      return NullPresenceChannel;
    }(NullChannel);

    /**
     * This class creates a connector to Pusher.
     */

    var PusherConnector = /*#__PURE__*/function (_Connector) {
      _inherits(PusherConnector, _Connector);

      var _super = _createSuper(PusherConnector);

      function PusherConnector() {
        var _this;

        _classCallCheck(this, PusherConnector);

        _this = _super.apply(this, arguments);
        /**
         * All of the subscribed channel names.
         */

        _this.channels = {};
        return _this;
      }
      /**
       * Create a fresh Pusher connection.
       */


      _createClass(PusherConnector, [{
        key: "connect",
        value: function connect() {
          if (typeof this.options.client !== 'undefined') {
            this.pusher = this.options.client;
          } else {
            this.pusher = new Pusher(this.options.key, this.options);
          }
        }
        /**
         * Listen for an event on a channel instance.
         */

      }, {
        key: "listen",
        value: function listen(name, event, callback) {
          return this.channel(name).listen(event, callback);
        }
        /**
         * Get a channel instance by name.
         */

      }, {
        key: "channel",
        value: function channel(name) {
          if (!this.channels[name]) {
            this.channels[name] = new PusherChannel(this.pusher, name, this.options);
          }

          return this.channels[name];
        }
        /**
         * Get a private channel instance by name.
         */

      }, {
        key: "privateChannel",
        value: function privateChannel(name) {
          if (!this.channels['private-' + name]) {
            this.channels['private-' + name] = new PusherPrivateChannel(this.pusher, 'private-' + name, this.options);
          }

          return this.channels['private-' + name];
        }
        /**
         * Get a private encrypted channel instance by name.
         */

      }, {
        key: "encryptedPrivateChannel",
        value: function encryptedPrivateChannel(name) {
          if (!this.channels['private-encrypted-' + name]) {
            this.channels['private-encrypted-' + name] = new PusherEncryptedPrivateChannel(this.pusher, 'private-encrypted-' + name, this.options);
          }

          return this.channels['private-encrypted-' + name];
        }
        /**
         * Get a presence channel instance by name.
         */

      }, {
        key: "presenceChannel",
        value: function presenceChannel(name) {
          if (!this.channels['presence-' + name]) {
            this.channels['presence-' + name] = new PusherPresenceChannel(this.pusher, 'presence-' + name, this.options);
          }

          return this.channels['presence-' + name];
        }
        /**
         * Leave the given channel, as well as its private and presence variants.
         */

      }, {
        key: "leave",
        value: function leave(name) {
          var _this2 = this;

          var channels = [name, 'private-' + name, 'presence-' + name];
          channels.forEach(function (name, index) {
            _this2.leaveChannel(name);
          });
        }
        /**
         * Leave the given channel.
         */

      }, {
        key: "leaveChannel",
        value: function leaveChannel(name) {
          if (this.channels[name]) {
            this.channels[name].unsubscribe();
            delete this.channels[name];
          }
        }
        /**
         * Get the socket ID for the connection.
         */

      }, {
        key: "socketId",
        value: function socketId() {
          return this.pusher.connection.socket_id;
        }
        /**
         * Disconnect Pusher connection.
         */

      }, {
        key: "disconnect",
        value: function disconnect() {
          this.pusher.disconnect();
        }
      }]);

      return PusherConnector;
    }(Connector);

    /**
     * This class creates a connnector to a Socket.io server.
     */

    var SocketIoConnector = /*#__PURE__*/function (_Connector) {
      _inherits(SocketIoConnector, _Connector);

      var _super = _createSuper(SocketIoConnector);

      function SocketIoConnector() {
        var _this;

        _classCallCheck(this, SocketIoConnector);

        _this = _super.apply(this, arguments);
        /**
         * All of the subscribed channel names.
         */

        _this.channels = {};
        return _this;
      }
      /**
       * Create a fresh Socket.io connection.
       */


      _createClass(SocketIoConnector, [{
        key: "connect",
        value: function connect() {
          var io = this.getSocketIO();
          this.socket = io(this.options.host, this.options);
          return this.socket;
        }
        /**
         * Get socket.io module from global scope or options.
         */

      }, {
        key: "getSocketIO",
        value: function getSocketIO() {
          if (typeof this.options.client !== 'undefined') {
            return this.options.client;
          }

          if (typeof io !== 'undefined') {
            return io;
          }

          throw new Error('Socket.io client not found. Should be globally available or passed via options.client');
        }
        /**
         * Listen for an event on a channel instance.
         */

      }, {
        key: "listen",
        value: function listen(name, event, callback) {
          return this.channel(name).listen(event, callback);
        }
        /**
         * Get a channel instance by name.
         */

      }, {
        key: "channel",
        value: function channel(name) {
          if (!this.channels[name]) {
            this.channels[name] = new SocketIoChannel(this.socket, name, this.options);
          }

          return this.channels[name];
        }
        /**
         * Get a private channel instance by name.
         */

      }, {
        key: "privateChannel",
        value: function privateChannel(name) {
          if (!this.channels['private-' + name]) {
            this.channels['private-' + name] = new SocketIoPrivateChannel(this.socket, 'private-' + name, this.options);
          }

          return this.channels['private-' + name];
        }
        /**
         * Get a presence channel instance by name.
         */

      }, {
        key: "presenceChannel",
        value: function presenceChannel(name) {
          if (!this.channels['presence-' + name]) {
            this.channels['presence-' + name] = new SocketIoPresenceChannel(this.socket, 'presence-' + name, this.options);
          }

          return this.channels['presence-' + name];
        }
        /**
         * Leave the given channel, as well as its private and presence variants.
         */

      }, {
        key: "leave",
        value: function leave(name) {
          var _this2 = this;

          var channels = [name, 'private-' + name, 'presence-' + name];
          channels.forEach(function (name) {
            _this2.leaveChannel(name);
          });
        }
        /**
         * Leave the given channel.
         */

      }, {
        key: "leaveChannel",
        value: function leaveChannel(name) {
          if (this.channels[name]) {
            this.channels[name].unsubscribe();
            delete this.channels[name];
          }
        }
        /**
         * Get the socket ID for the connection.
         */

      }, {
        key: "socketId",
        value: function socketId() {
          return this.socket.id;
        }
        /**
         * Disconnect Socketio connection.
         */

      }, {
        key: "disconnect",
        value: function disconnect() {
          this.socket.disconnect();
        }
      }]);

      return SocketIoConnector;
    }(Connector);

    /**
     * This class creates a null connector.
     */

    var NullConnector = /*#__PURE__*/function (_Connector) {
      _inherits(NullConnector, _Connector);

      var _super = _createSuper(NullConnector);

      function NullConnector() {
        var _this;

        _classCallCheck(this, NullConnector);

        _this = _super.apply(this, arguments);
        /**
         * All of the subscribed channel names.
         */

        _this.channels = {};
        return _this;
      }
      /**
       * Create a fresh connection.
       */


      _createClass(NullConnector, [{
        key: "connect",
        value: function connect() {} //

        /**
         * Listen for an event on a channel instance.
         */

      }, {
        key: "listen",
        value: function listen(name, event, callback) {
          return new NullChannel();
        }
        /**
         * Get a channel instance by name.
         */

      }, {
        key: "channel",
        value: function channel(name) {
          return new NullChannel();
        }
        /**
         * Get a private channel instance by name.
         */

      }, {
        key: "privateChannel",
        value: function privateChannel(name) {
          return new NullPrivateChannel();
        }
        /**
         * Get a presence channel instance by name.
         */

      }, {
        key: "presenceChannel",
        value: function presenceChannel(name) {
          return new NullPresenceChannel();
        }
        /**
         * Leave the given channel, as well as its private and presence variants.
         */

      }, {
        key: "leave",
        value: function leave(name) {} //

        /**
         * Leave the given channel.
         */

      }, {
        key: "leaveChannel",
        value: function leaveChannel(name) {} //

        /**
         * Get the socket ID for the connection.
         */

      }, {
        key: "socketId",
        value: function socketId() {
          return 'fake-socket-id';
        }
        /**
         * Disconnect the connection.
         */

      }, {
        key: "disconnect",
        value: function disconnect() {//
        }
      }]);

      return NullConnector;
    }(Connector);

    /**
     * This class is the primary API for interacting with broadcasting.
     */

    var Echo = /*#__PURE__*/function () {
      /**
       * Create a new class instance.
       */
      function Echo(options) {
        _classCallCheck(this, Echo);

        this.options = options;
        this.connect();

        if (!this.options.withoutInterceptors) {
          this.registerInterceptors();
        }
      }
      /**
       * Get a channel instance by name.
       */


      _createClass(Echo, [{
        key: "channel",
        value: function channel(_channel) {
          return this.connector.channel(_channel);
        }
        /**
         * Create a new connection.
         */

      }, {
        key: "connect",
        value: function connect() {
          if (this.options.broadcaster == 'pusher') {
            this.connector = new PusherConnector(this.options);
          } else if (this.options.broadcaster == 'socket.io') {
            this.connector = new SocketIoConnector(this.options);
          } else if (this.options.broadcaster == 'null') {
            this.connector = new NullConnector(this.options);
          } else if (typeof this.options.broadcaster == 'function') {
            this.connector = new this.options.broadcaster(this.options);
          }
        }
        /**
         * Disconnect from the Echo server.
         */

      }, {
        key: "disconnect",
        value: function disconnect() {
          this.connector.disconnect();
        }
        /**
         * Get a presence channel instance by name.
         */

      }, {
        key: "join",
        value: function join(channel) {
          return this.connector.presenceChannel(channel);
        }
        /**
         * Leave the given channel, as well as its private and presence variants.
         */

      }, {
        key: "leave",
        value: function leave(channel) {
          this.connector.leave(channel);
        }
        /**
         * Leave the given channel.
         */

      }, {
        key: "leaveChannel",
        value: function leaveChannel(channel) {
          this.connector.leaveChannel(channel);
        }
        /**
         * Listen for an event on a channel instance.
         */

      }, {
        key: "listen",
        value: function listen(channel, event, callback) {
          return this.connector.listen(channel, event, callback);
        }
        /**
         * Get a private channel instance by name.
         */

      }, {
        key: "private",
        value: function _private(channel) {
          return this.connector.privateChannel(channel);
        }
        /**
         * Get a private encrypted channel instance by name.
         */

      }, {
        key: "encryptedPrivate",
        value: function encryptedPrivate(channel) {
          return this.connector.encryptedPrivateChannel(channel);
        }
        /**
         * Get the Socket ID for the connection.
         */

      }, {
        key: "socketId",
        value: function socketId() {
          return this.connector.socketId();
        }
        /**
         * Register 3rd party request interceptiors. These are used to automatically
         * send a connections socket id to a Laravel app with a X-Socket-Id header.
         */

      }, {
        key: "registerInterceptors",
        value: function registerInterceptors() {
          if (typeof Vue === 'function' && Vue.http) {
            this.registerVueRequestInterceptor();
          }

          if (typeof axios === 'function') {
            this.registerAxiosRequestInterceptor();
          }

          if (typeof jQuery === 'function') {
            this.registerjQueryAjaxSetup();
          }
        }
        /**
         * Register a Vue HTTP interceptor to add the X-Socket-ID header.
         */

      }, {
        key: "registerVueRequestInterceptor",
        value: function registerVueRequestInterceptor() {
          var _this = this;

          Vue.http.interceptors.push(function (request, next) {
            if (_this.socketId()) {
              request.headers.set('X-Socket-ID', _this.socketId());
            }

            next();
          });
        }
        /**
         * Register an Axios HTTP interceptor to add the X-Socket-ID header.
         */

      }, {
        key: "registerAxiosRequestInterceptor",
        value: function registerAxiosRequestInterceptor() {
          var _this2 = this;

          axios.interceptors.request.use(function (config) {
            if (_this2.socketId()) {
              config.headers['X-Socket-Id'] = _this2.socketId();
            }

            return config;
          });
        }
        /**
         * Register jQuery AjaxPrefilter to add the X-Socket-ID header.
         */

      }, {
        key: "registerjQueryAjaxSetup",
        value: function registerjQueryAjaxSetup() {
          var _this3 = this;

          if (typeof jQuery.ajax != 'undefined') {
            jQuery.ajaxPrefilter(function (options, originalOptions, xhr) {
              if (_this3.socketId()) {
                xhr.setRequestHeader('X-Socket-Id', _this3.socketId());
              }
            });
          }
        }
      }]);

      return Echo;
    }();

    /* src/Messages.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$5 = "src/Messages.svelte";

    // (116:2) {#if isLoading}
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
    		source: "(116:2) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (129:0) {#if showScrollToBottom}
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
    		source: "(129:0) {#if showScrollToBottom}",
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
    	messageinput.$on("message", /*message_handler*/ ctx[14]);
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
    			if_block1_anchor = empty();
    			attr_dev(main_1, "class", "svelte-i15h9r");
    			add_location(main_1, file$5, 114, 0, 3053);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, main_1, anchor);
    			if (if_block0) if_block0.m(main_1, null);
    			append_dev(main_1, t0);
    			mount_component(messagelist, main_1, null);
    			/*main_1_binding*/ ctx[13](main_1);
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
    			/*main_1_binding*/ ctx[13](null);
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
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate(11, $user = $$value));
    	let showMessages = 100; // initial messages to load
    	let store = {};
    	let chats = [];
    	let autoscroll;
    	let showScrollToBottom;
    	let main;
    	let isLoading = false;
    	let timeout;
    	let echo;

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
    					showMessages += ADD_ON_SCROLL;
    					if (main.scrollTop === 0) $$invalidate(2, main.scrollTop = 1, main);
    					$$invalidate(3, isLoading = false);
    				},
    				200
    			);
    		}
    	}

    	function handleNewMessage(msg) {
    		const now = new Date().getTime();
    	}

    	onMount(async () => {
    		const id = localStorage.getItem("conversation_id");

    		if (id) {
    			const token = localStorage.getItem("visitor_token");
    			const channel = `conversation.${id}.messaging`;

    			echo = new Echo({
    					broadcaster: "socket.io",
    					host: request.socketUrl,
    					auth: {
    						headers: { Authorization: `Bearer ${token}` }
    					}
    				});

    			const { data } = await request({
    				url: `api/conversation/${id}/messages`,
    				method: "GET"
    			});

    			$$invalidate(0, chats = data.messages);
    			$$invalidate(3, isLoading = false);

    			echo.join(channel).here().joining().leaving().listen(".message.created", e => {
    				chats.push(e);
    			});
    		}
    	});

    	beforeUpdate(() => {
    		autoscroll = main && main.offsetHeight + main.scrollTop > main.scrollHeight - 50;
    	});

    	afterUpdate(() => {
    		if (autoscroll) main.scrollTo(0, main.scrollHeight);
    	});

    	onDestroy(() => {
    		
    	}); // remove gun listeners

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Messages> was created with unknown prop '${key}'`);
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
    		user,
    		ScrollToBottom,
    		MessageInput,
    		MessageList,
    		Spinner,
    		request,
    		Echo,
    		ADD_ON_SCROLL,
    		showMessages,
    		store,
    		chats,
    		autoscroll,
    		showScrollToBottom,
    		main,
    		isLoading,
    		timeout,
    		echo,
    		scrollToBottom,
    		handleScroll,
    		handleNewMessage,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ("showMessages" in $$props) showMessages = $$props.showMessages;
    		if ("store" in $$props) store = $$props.store;
    		if ("chats" in $$props) $$invalidate(0, chats = $$props.chats);
    		if ("autoscroll" in $$props) autoscroll = $$props.autoscroll;
    		if ("showScrollToBottom" in $$props) $$invalidate(1, showScrollToBottom = $$props.showScrollToBottom);
    		if ("main" in $$props) $$invalidate(2, main = $$props.main);
    		if ("isLoading" in $$props) $$invalidate(3, isLoading = $$props.isLoading);
    		if ("timeout" in $$props) $$invalidate(9, timeout = $$props.timeout);
    		if ("echo" in $$props) echo = $$props.echo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*timeout, chats*/ 513) {
    			 {
    				// isLoading = true;
    				if (timeout) clearTimeout(timeout);

    				// debounce update svelte store to avoid overloading ui
    				$$invalidate(9, timeout = setTimeout(
    					() => {
    						// convert key/value object to sorted array of messages (with a max length)
    						// const arr = Object.values(store);
    						// const sorted = arr.sort((a, b) => a.time - b.time);
    						// const begin = Math.max(0, sorted.length - showMessages);
    						// const end = arr.length;
    						($$invalidate(0, chats), $$invalidate(9, timeout));

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
    		autoscroll,
    		timeout,
    		echo,
    		$user,
    		store,
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
    	let t15_value = "5aa6f90" + "";
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

    // (32:2) {#if _data}
    function create_if_block$3(ctx) {
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(32:2) {#if _data}",
    		ctx
    	});

    	return block;
    }

    // (33:4) <Nav>
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
    		source: "(33:4) <Nav>",
    		ctx
    	});

    	return block;
    }

    // (31:0) <Page>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*_data*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*_data*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*_data*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(31:0) <Page>",
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

    			if (dirty & /*$$scope, _data*/ 3) {
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
    	let { _data = null } = $$props;

    	onMount(async () => {
    		// $nav = "messages";
    		const { data } = await request({
    			url: `api/visitor/init`,
    			method: "POST",
    			data: {
    				institution_id: "rxpXD6uDD0EJqvbD",
    				unique_id: "123456",
    				userAgent: navigator.userAgent,
    				languages: navigator.languages,
    				url: location.href,
    				title: document.title,
    				name: "visitor001"
    			}
    		});

    		localStorage.setItem("visitor_token", data.visitor_token);
    		localStorage.setItem("conversation_id", data.conversation.id);
    		$$invalidate(0, _data = data);
    	});

    	const writable_props = ["_data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("_data" in $$props) $$invalidate(0, _data = $$props._data);
    	};

    	$$self.$capture_state = () => ({
    		nav,
    		user,
    		Messages,
    		Nav,
    		Page,
    		Footer,
    		onMount,
    		request,
    		_data
    	});

    	$$self.$inject_state = $$props => {
    		if ("_data" in $$props) $$invalidate(0, _data = $$props._data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_data];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { _data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get _data() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set _data(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
