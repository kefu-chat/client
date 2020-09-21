
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

    // (96:2) {:else}
    function create_else_block(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "rows", /*rows*/ ctx[7]);
    			attr_dev(input, "class", "input svelte-c4fbvv");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", /*maxLength*/ ctx[5]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			attr_dev(input, "aria-labelledby", /*ariaLabelledBy*/ ctx[1]);
    			attr_dev(input, "aria-label", /*ariaLabel*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
    			add_location(input, file$1, 96, 4, 2503);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[11]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows*/ 128) {
    				attr_dev(input, "rows", /*rows*/ ctx[7]);
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
    		source: "(96:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:2) {#if multiline}
    function create_if_block_1(ctx) {
    	let textarea;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "rows", /*rows*/ ctx[7]);
    			attr_dev(textarea, "class", "input svelte-c4fbvv");
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "maxlength", /*maxLength*/ ctx[5]);
    			attr_dev(textarea, "name", /*name*/ ctx[4]);
    			attr_dev(textarea, "aria-labelledby", /*ariaLabelledBy*/ ctx[1]);
    			attr_dev(textarea, "aria-label", /*ariaLabel*/ ctx[2]);
    			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[3]);
    			add_location(textarea, file$1, 84, 4, 2254);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[10]),
    				listen_dev(textarea, "keypress", handleKeyPress, false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows*/ 128) {
    				attr_dev(textarea, "rows", /*rows*/ ctx[7]);
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
    		source: "(84:2) {#if multiline}",
    		ctx
    	});

    	return block;
    }

    // (108:2) {#if value}
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
    			add_location(input, file$1, 108, 4, 2726);
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
    		source: "(108:2) {#if value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*multiline*/ ctx[6]) return create_if_block_1;
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
    			add_location(div, file$1, 82, 0, 2200);
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
    		if ("maxRows" in $$props) $$invalidate(8, maxRows = $$props.maxRows);
    		if ("multiline" in $$props) $$invalidate(6, multiline = $$props.multiline);
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
    		if ("maxRows" in $$props) $$invalidate(8, maxRows = $$props.maxRows);
    		if ("multiline" in $$props) $$invalidate(6, multiline = $$props.multiline);
    		if ("rows" in $$props) $$invalidate(7, rows = $$props.rows);
    	};

    	let rows;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			 $$invalidate(7, rows = calcRows(value));
    		}
    	};

    	return [
    		value,
    		ariaLabelledBy,
    		ariaLabel,
    		placeholder,
    		name,
    		maxLength,
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
    			maxRows: 8,
    			multiline: 6
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
    		/*input_value_binding*/ ctx[2].call(null, value);
    	}

    	let input_props = {
    		multiline: true,
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
    			add_location(form, file$2, 37, 2, 671);
    			attr_dev(div, "class", "svelte-1djjhy7");
    			add_location(div, file$2, 36, 0, 663);
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
    			dispose = listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[3]), false, true, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};

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

    	$$self.$capture_state = () => ({ Input, request, msgInput, sendMessage });

    	$$self.$inject_state = $$props => {
    		if ("msgInput" in $$props) $$invalidate(0, msgInput = $$props.msgInput);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [msgInput, sendMessage, input_value_binding, submit_handler];
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

    function requiredArgs(required, args) {
      if (args.length < required) {
        throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
      }
    }

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If the argument is none of the above, the function returns Invalid Date.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     *
     * @param {Date|Number} argument - the value to convert
     * @returns {Date} the parsed date in the local time zone
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Clone the date:
     * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert the timestamp to date:
     * const result = toDate(1392098430000)
     * //=> Tue Feb 11 2014 11:30:30
     */

    function toDate(argument) {
      requiredArgs(1, arguments);
      var argStr = Object.prototype.toString.call(argument); // Clone the date

      if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument);
      } else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"); // eslint-disable-next-line no-console

          console.warn(new Error().stack);
        }

        return new Date(NaN);
      }
    }

    /**
     * @name isValid
     * @category Common Helpers
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - Now `isValid` doesn't throw an exception
     *   if the first argument is not an instance of Date.
     *   Instead, argument is converted beforehand using `toDate`.
     *
     *   Examples:
     *
     *   | `isValid` argument        | Before v2.0.0 | v2.0.0 onward |
     *   |---------------------------|---------------|---------------|
     *   | `new Date()`              | `true`        | `true`        |
     *   | `new Date('2016-01-01')`  | `true`        | `true`        |
     *   | `new Date('')`            | `false`       | `false`       |
     *   | `new Date(1488370835081)` | `true`        | `true`        |
     *   | `new Date(NaN)`           | `false`       | `false`       |
     *   | `'2016-01-01'`            | `TypeError`   | `false`       |
     *   | `''`                      | `TypeError`   | `false`       |
     *   | `1488370835081`           | `TypeError`   | `true`        |
     *   | `NaN`                     | `TypeError`   | `false`       |
     *
     *   We introduce this change to make *date-fns* consistent with ECMAScript behavior
     *   that try to coerce arguments to the expected type
     *   (which is also the case with other *date-fns* functions).
     *
     * @param {*} date - the date to check
     * @returns {Boolean} the date is valid
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // For the valid date:
     * var result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the value, convertable into a date:
     * var result = isValid(1393804800000)
     * //=> true
     *
     * @example
     * // For the invalid date:
     * var result = isValid(new Date(''))
     * //=> false
     */

    function isValid(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      return !isNaN(date);
    }

    var formatDistanceLocale = {
      lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} seconds'
      },
      xSeconds: {
        one: '1 second',
        other: '{{count}} seconds'
      },
      halfAMinute: 'half a minute',
      lessThanXMinutes: {
        one: 'less than a minute',
        other: 'less than {{count}} minutes'
      },
      xMinutes: {
        one: '1 minute',
        other: '{{count}} minutes'
      },
      aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours'
      },
      xHours: {
        one: '1 hour',
        other: '{{count}} hours'
      },
      xDays: {
        one: '1 day',
        other: '{{count}} days'
      },
      aboutXWeeks: {
        one: 'about 1 week',
        other: 'about {{count}} weeks'
      },
      xWeeks: {
        one: '1 week',
        other: '{{count}} weeks'
      },
      aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months'
      },
      xMonths: {
        one: '1 month',
        other: '{{count}} months'
      },
      aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years'
      },
      xYears: {
        one: '1 year',
        other: '{{count}} years'
      },
      overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years'
      },
      almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years'
      }
    };
    function formatDistance(token, count, options) {
      options = options || {};
      var result;

      if (typeof formatDistanceLocale[token] === 'string') {
        result = formatDistanceLocale[token];
      } else if (count === 1) {
        result = formatDistanceLocale[token].one;
      } else {
        result = formatDistanceLocale[token].other.replace('{{count}}', count);
      }

      if (options.addSuffix) {
        if (options.comparison > 0) {
          return 'in ' + result;
        } else {
          return result + ' ago';
        }
      }

      return result;
    }

    function buildFormatLongFn(args) {
      return function (dirtyOptions) {
        var options = dirtyOptions || {};
        var width = options.width ? String(options.width) : args.defaultWidth;
        var format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
      };
    }

    var dateFormats = {
      full: 'EEEE, MMMM do, y',
      long: 'MMMM do, y',
      medium: 'MMM d, y',
      short: 'MM/dd/yyyy'
    };
    var timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };
    var dateTimeFormats = {
      full: "{{date}} 'at' {{time}}",
      long: "{{date}} 'at' {{time}}",
      medium: '{{date}}, {{time}}',
      short: '{{date}}, {{time}}'
    };
    var formatLong = {
      date: buildFormatLongFn({
        formats: dateFormats,
        defaultWidth: 'full'
      }),
      time: buildFormatLongFn({
        formats: timeFormats,
        defaultWidth: 'full'
      }),
      dateTime: buildFormatLongFn({
        formats: dateTimeFormats,
        defaultWidth: 'full'
      })
    };

    var formatRelativeLocale = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: 'P'
    };
    function formatRelative(token, _date, _baseDate, _options) {
      return formatRelativeLocale[token];
    }

    function buildLocalizeFn(args) {
      return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {};
        var context = options.context ? String(options.context) : 'standalone';
        var valuesArray;

        if (context === 'formatting' && args.formattingValues) {
          var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
          var width = options.width ? String(options.width) : defaultWidth;
          valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
          var _defaultWidth = args.defaultWidth;

          var _width = options.width ? String(options.width) : args.defaultWidth;

          valuesArray = args.values[_width] || args.values[_defaultWidth];
        }

        var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
        return valuesArray[index];
      };
    }

    var eraValues = {
      narrow: ['B', 'A'],
      abbreviated: ['BC', 'AD'],
      wide: ['Before Christ', 'Anno Domini']
    };
    var quarterValues = {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] // Note: in English, the names of days of the week and months are capitalized.
      // If you are making a new locale based on this one, check if the same is true for the language you're working on.
      // Generally, formatted dates should look like they are in the middle of a sentence,
      // e.g. in Spanish language the weekdays and months should be in the lowercase.

    };
    var monthValues = {
      narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
    var dayValues = {
      narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    var dayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      }
    };
    var formattingDayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      }
    };

    function ordinalNumber(dirtyNumber, _dirtyOptions) {
      var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
      // if they are different for different grammatical genders,
      // use `options.unit`:
      //
      //   var options = dirtyOptions || {}
      //   var unit = String(options.unit)
      //
      // where `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
      // 'day', 'hour', 'minute', 'second'

      var rem100 = number % 100;

      if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
          case 1:
            return number + 'st';

          case 2:
            return number + 'nd';

          case 3:
            return number + 'rd';
        }
      }

      return number + 'th';
    }

    var localize = {
      ordinalNumber: ordinalNumber,
      era: buildLocalizeFn({
        values: eraValues,
        defaultWidth: 'wide'
      }),
      quarter: buildLocalizeFn({
        values: quarterValues,
        defaultWidth: 'wide',
        argumentCallback: function (quarter) {
          return Number(quarter) - 1;
        }
      }),
      month: buildLocalizeFn({
        values: monthValues,
        defaultWidth: 'wide'
      }),
      day: buildLocalizeFn({
        values: dayValues,
        defaultWidth: 'wide'
      }),
      dayPeriod: buildLocalizeFn({
        values: dayPeriodValues,
        defaultWidth: 'wide',
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: 'wide'
      })
    };

    function buildMatchPatternFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var matchResult = string.match(args.matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parseResult = string.match(args.parsePattern);

        if (!parseResult) {
          return null;
        }

        var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function buildMatchFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var width = options.width;
        var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
        var matchResult = string.match(matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
        var value;

        if (Object.prototype.toString.call(parsePatterns) === '[object Array]') {
          value = findIndex(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        } else {
          value = findKey(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        }

        value = args.valueCallback ? args.valueCallback(value) : value;
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function findKey(object, predicate) {
      for (var key in object) {
        if (object.hasOwnProperty(key) && predicate(object[key])) {
          return key;
        }
      }
    }

    function findIndex(array, predicate) {
      for (var key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
          return key;
        }
      }
    }

    var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
    var parseOrdinalNumberPattern = /\d+/i;
    var matchEraPatterns = {
      narrow: /^(b|a)/i,
      abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
      wide: /^(before christ|before common era|anno domini|common era)/i
    };
    var parseEraPatterns = {
      any: [/^b/i, /^(a|c)/i]
    };
    var matchQuarterPatterns = {
      narrow: /^[1234]/i,
      abbreviated: /^q[1234]/i,
      wide: /^[1234](th|st|nd|rd)? quarter/i
    };
    var parseQuarterPatterns = {
      any: [/1/i, /2/i, /3/i, /4/i]
    };
    var matchMonthPatterns = {
      narrow: /^[jfmasond]/i,
      abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };
    var parseMonthPatterns = {
      narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
      any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };
    var matchDayPatterns = {
      narrow: /^[smtwf]/i,
      short: /^(su|mo|tu|we|th|fr|sa)/i,
      abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
      wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };
    var parseDayPatterns = {
      narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
      any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };
    var matchDayPeriodPatterns = {
      narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
      any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
    };
    var parseDayPeriodPatterns = {
      any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i
      }
    };
    var match = {
      ordinalNumber: buildMatchPatternFn({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: function (value) {
          return parseInt(value, 10);
        }
      }),
      era: buildMatchFn({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseEraPatterns,
        defaultParseWidth: 'any'
      }),
      quarter: buildMatchFn({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: 'any',
        valueCallback: function (index) {
          return index + 1;
        }
      }),
      month: buildMatchFn({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: 'any'
      }),
      day: buildMatchFn({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseDayPatterns,
        defaultParseWidth: 'any'
      }),
      dayPeriod: buildMatchFn({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: 'any',
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: 'any'
      })
    };

    /**
     * @type {Locale}
     * @category Locales
     * @summary English locale (United States).
     * @language English
     * @iso-639-2 eng
     * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
     * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
     */

    var locale = {
      code: 'en-US',
      formatDistance: formatDistance,
      formatLong: formatLong,
      formatRelative: formatRelative,
      localize: localize,
      match: match,
      options: {
        weekStartsOn: 0
        /* Sunday */
        ,
        firstWeekContainsDate: 1
      }
    };

    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
      }

      var number = Number(dirtyNumber);

      if (isNaN(number)) {
        return number;
      }

      return number < 0 ? Math.ceil(number) : Math.floor(number);
    }

    /**
     * @name addMilliseconds
     * @category Millisecond Helpers
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds added
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * var result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */

    function addMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var timestamp = toDate(dirtyDate).getTime();
      var amount = toInteger(dirtyAmount);
      return new Date(timestamp + amount);
    }

    /**
     * @name subMilliseconds
     * @category Millisecond Helpers
     * @summary Subtract the specified number of milliseconds from the given date.
     *
     * @description
     * Subtract the specified number of milliseconds from the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds subtracted
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
     * var result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:29.250
     */

    function subMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var amount = toInteger(dirtyAmount);
      return addMilliseconds(dirtyDate, -amount);
    }

    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();

      while (output.length < targetLength) {
        output = '0' + output;
      }

      return sign + output;
    }

    /*
     * |     | Unit                           |     | Unit                           |
     * |-----|--------------------------------|-----|--------------------------------|
     * |  a  | AM, PM                         |  A* |                                |
     * |  d  | Day of month                   |  D  |                                |
     * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
     * |  m  | Minute                         |  M  | Month                          |
     * |  s  | Second                         |  S  | Fraction of second             |
     * |  y  | Year (abs)                     |  Y  |                                |
     *
     * Letters marked by * are not implemented but reserved by Unicode standard.
     */

    var formatters = {
      // Year
      y: function (date, token) {
        // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
        var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
      },
      // Month
      M: function (date, token) {
        var month = date.getUTCMonth();
        return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
      },
      // Day of the month
      d: function (date, token) {
        return addLeadingZeros(date.getUTCDate(), token.length);
      },
      // AM or PM
      a: function (date, token) {
        var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return dayPeriodEnumValue.toUpperCase();

          case 'aaaaa':
            return dayPeriodEnumValue[0];

          case 'aaaa':
          default:
            return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
        }
      },
      // Hour [1-12]
      h: function (date, token) {
        return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
      },
      // Hour [0-23]
      H: function (date, token) {
        return addLeadingZeros(date.getUTCHours(), token.length);
      },
      // Minute
      m: function (date, token) {
        return addLeadingZeros(date.getUTCMinutes(), token.length);
      },
      // Second
      s: function (date, token) {
        return addLeadingZeros(date.getUTCSeconds(), token.length);
      },
      // Fraction of second
      S: function (date, token) {
        var numberOfDigits = token.length;
        var milliseconds = date.getUTCMilliseconds();
        var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
        return addLeadingZeros(fractionalSeconds, token.length);
      }
    };

    var MILLISECONDS_IN_DAY = 86400000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCDayOfYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var timestamp = date.getTime();
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      var startOfYearTimestamp = date.getTime();
      var difference = timestamp - startOfYearTimestamp;
      return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var weekStartsOn = 1;
      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var year = date.getUTCFullYear();
      var fourthOfJanuaryOfNextYear = new Date(0);
      fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
      fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
      var fourthOfJanuaryOfThisYear = new Date(0);
      fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
      fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var year = getUTCISOWeekYear(dirtyDate);
      var fourthOfJanuary = new Date(0);
      fourthOfJanuary.setUTCFullYear(year, 0, 4);
      fourthOfJanuary.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCISOWeek(fourthOfJanuary);
      return date;
    }

    var MILLISECONDS_IN_WEEK = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeek(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate, dirtyOptions);
      var year = date.getUTCFullYear();
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var firstWeekOfNextYear = new Date(0);
      firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
      firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
      var firstWeekOfThisYear = new Date(0);
      firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
      var year = getUTCWeekYear(dirtyDate, dirtyOptions);
      var firstWeek = new Date(0);
      firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeek.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCWeek(firstWeek, dirtyOptions);
      return date;
    }

    var MILLISECONDS_IN_WEEK$1 = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeek(dirtyDate, options) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
    }

    var dayPeriodEnum = {
      am: 'am',
      pm: 'pm',
      midnight: 'midnight',
      noon: 'noon',
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'night'
      /*
       * |     | Unit                           |     | Unit                           |
       * |-----|--------------------------------|-----|--------------------------------|
       * |  a  | AM, PM                         |  A* | Milliseconds in day            |
       * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
       * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
       * |  d  | Day of month                   |  D  | Day of year                    |
       * |  e  | Local day of week              |  E  | Day of week                    |
       * |  f  |                                |  F* | Day of week in month           |
       * |  g* | Modified Julian day            |  G  | Era                            |
       * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
       * |  i! | ISO day of week                |  I! | ISO week of year               |
       * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
       * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
       * |  l* | (deprecated)                   |  L  | Stand-alone month              |
       * |  m  | Minute                         |  M  | Month                          |
       * |  n  |                                |  N  |                                |
       * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
       * |  p! | Long localized time            |  P! | Long localized date            |
       * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
       * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
       * |  s  | Second                         |  S  | Fraction of second             |
       * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
       * |  u  | Extended year                  |  U* | Cyclic year                    |
       * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
       * |  w  | Local week of year             |  W* | Week of month                  |
       * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
       * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
       * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
       *
       * Letters marked by * are not implemented but reserved by Unicode standard.
       *
       * Letters marked by ! are non-standard, but implemented by date-fns:
       * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
       * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
       *   i.e. 7 for Sunday, 1 for Monday, etc.
       * - `I` is ISO week of year, as opposed to `w` which is local week of year.
       * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
       *   `R` is supposed to be used in conjunction with `I` and `i`
       *   for universal ISO week-numbering date, whereas
       *   `Y` is supposed to be used in conjunction with `w` and `e`
       *   for week-numbering date specific to the locale.
       * - `P` is long localized date format
       * - `p` is long localized time format
       */

    };
    var formatters$1 = {
      // Era
      G: function (date, token, localize) {
        var era = date.getUTCFullYear() > 0 ? 1 : 0;

        switch (token) {
          // AD, BC
          case 'G':
          case 'GG':
          case 'GGG':
            return localize.era(era, {
              width: 'abbreviated'
            });
          // A, B

          case 'GGGGG':
            return localize.era(era, {
              width: 'narrow'
            });
          // Anno Domini, Before Christ

          case 'GGGG':
          default:
            return localize.era(era, {
              width: 'wide'
            });
        }
      },
      // Year
      y: function (date, token, localize) {
        // Ordinal number
        if (token === 'yo') {
          var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

          var year = signedYear > 0 ? signedYear : 1 - signedYear;
          return localize.ordinalNumber(year, {
            unit: 'year'
          });
        }

        return formatters.y(date, token);
      },
      // Local week-numbering year
      Y: function (date, token, localize, options) {
        var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

        if (token === 'YY') {
          var twoDigitYear = weekYear % 100;
          return addLeadingZeros(twoDigitYear, 2);
        } // Ordinal number


        if (token === 'Yo') {
          return localize.ordinalNumber(weekYear, {
            unit: 'year'
          });
        } // Padding


        return addLeadingZeros(weekYear, token.length);
      },
      // ISO week-numbering year
      R: function (date, token) {
        var isoWeekYear = getUTCISOWeekYear(date); // Padding

        return addLeadingZeros(isoWeekYear, token.length);
      },
      // Extended year. This is a single number designating the year of this calendar system.
      // The main difference between `y` and `u` localizers are B.C. years:
      // | Year | `y` | `u` |
      // |------|-----|-----|
      // | AC 1 |   1 |   1 |
      // | BC 1 |   1 |   0 |
      // | BC 2 |   2 |  -1 |
      // Also `yy` always returns the last two digits of a year,
      // while `uu` pads single digit years to 2 characters and returns other years unchanged.
      u: function (date, token) {
        var year = date.getUTCFullYear();
        return addLeadingZeros(year, token.length);
      },
      // Quarter
      Q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'Q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'QQ':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'Qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'QQQ':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'QQQQQ':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'formatting'
            });
          // 1st quarter, 2nd quarter, ...

          case 'QQQQ':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone quarter
      q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'qq':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'qqq':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'qqqqq':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'standalone'
            });
          // 1st quarter, 2nd quarter, ...

          case 'qqqq':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Month
      M: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          case 'M':
          case 'MM':
            return formatters.M(date, token);
          // 1st, 2nd, ..., 12th

          case 'Mo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'MMM':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // J, F, ..., D

          case 'MMMMM':
            return localize.month(month, {
              width: 'narrow',
              context: 'formatting'
            });
          // January, February, ..., December

          case 'MMMM':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone month
      L: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          // 1, 2, ..., 12
          case 'L':
            return String(month + 1);
          // 01, 02, ..., 12

          case 'LL':
            return addLeadingZeros(month + 1, 2);
          // 1st, 2nd, ..., 12th

          case 'Lo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'LLL':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // J, F, ..., D

          case 'LLLLL':
            return localize.month(month, {
              width: 'narrow',
              context: 'standalone'
            });
          // January, February, ..., December

          case 'LLLL':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Local week of year
      w: function (date, token, localize, options) {
        var week = getUTCWeek(date, options);

        if (token === 'wo') {
          return localize.ordinalNumber(week, {
            unit: 'week'
          });
        }

        return addLeadingZeros(week, token.length);
      },
      // ISO week of year
      I: function (date, token, localize) {
        var isoWeek = getUTCISOWeek(date);

        if (token === 'Io') {
          return localize.ordinalNumber(isoWeek, {
            unit: 'week'
          });
        }

        return addLeadingZeros(isoWeek, token.length);
      },
      // Day of the month
      d: function (date, token, localize) {
        if (token === 'do') {
          return localize.ordinalNumber(date.getUTCDate(), {
            unit: 'date'
          });
        }

        return formatters.d(date, token);
      },
      // Day of year
      D: function (date, token, localize) {
        var dayOfYear = getUTCDayOfYear(date);

        if (token === 'Do') {
          return localize.ordinalNumber(dayOfYear, {
            unit: 'dayOfYear'
          });
        }

        return addLeadingZeros(dayOfYear, token.length);
      },
      // Day of week
      E: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();

        switch (token) {
          // Tue
          case 'E':
          case 'EE':
          case 'EEE':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'EEEEE':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'EEEEEE':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'EEEE':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Local day of week
      e: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (Nth day of week with current locale or weekStartsOn)
          case 'e':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'ee':
            return addLeadingZeros(localDayOfWeek, 2);
          // 1st, 2nd, ..., 7th

          case 'eo':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'eee':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'eeeee':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'eeeeee':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'eeee':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone local day of week
      c: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (same as in `e`)
          case 'c':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'cc':
            return addLeadingZeros(localDayOfWeek, token.length);
          // 1st, 2nd, ..., 7th

          case 'co':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'ccc':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // T

          case 'ccccc':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'standalone'
            });
          // Tu

          case 'cccccc':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'standalone'
            });
          // Tuesday

          case 'cccc':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // ISO day of week
      i: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();
        var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

        switch (token) {
          // 2
          case 'i':
            return String(isoDayOfWeek);
          // 02

          case 'ii':
            return addLeadingZeros(isoDayOfWeek, token.length);
          // 2nd

          case 'io':
            return localize.ordinalNumber(isoDayOfWeek, {
              unit: 'day'
            });
          // Tue

          case 'iii':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'iiiii':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'iiiiii':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'iiii':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM or PM
      a: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'aaaaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'aaaa':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM, PM, midnight, noon
      b: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours === 12) {
          dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
          dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
          dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        }

        switch (token) {
          case 'b':
          case 'bb':
          case 'bbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'bbbbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'bbbb':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // in the morning, in the afternoon, in the evening, at night
      B: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours >= 17) {
          dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
          dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
          dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
          dayPeriodEnumValue = dayPeriodEnum.night;
        }

        switch (token) {
          case 'B':
          case 'BB':
          case 'BBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'BBBBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'BBBB':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Hour [1-12]
      h: function (date, token, localize) {
        if (token === 'ho') {
          var hours = date.getUTCHours() % 12;
          if (hours === 0) hours = 12;
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return formatters.h(date, token);
      },
      // Hour [0-23]
      H: function (date, token, localize) {
        if (token === 'Ho') {
          return localize.ordinalNumber(date.getUTCHours(), {
            unit: 'hour'
          });
        }

        return formatters.H(date, token);
      },
      // Hour [0-11]
      K: function (date, token, localize) {
        var hours = date.getUTCHours() % 12;

        if (token === 'Ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Hour [1-24]
      k: function (date, token, localize) {
        var hours = date.getUTCHours();
        if (hours === 0) hours = 24;

        if (token === 'ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Minute
      m: function (date, token, localize) {
        if (token === 'mo') {
          return localize.ordinalNumber(date.getUTCMinutes(), {
            unit: 'minute'
          });
        }

        return formatters.m(date, token);
      },
      // Second
      s: function (date, token, localize) {
        if (token === 'so') {
          return localize.ordinalNumber(date.getUTCSeconds(), {
            unit: 'second'
          });
        }

        return formatters.s(date, token);
      },
      // Fraction of second
      S: function (date, token) {
        return formatters.S(date, token);
      },
      // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
      X: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        if (timezoneOffset === 0) {
          return 'Z';
        }

        switch (token) {
          // Hours and optional minutes
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XX`

          case 'XXXX':
          case 'XX':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XXX`

          case 'XXXXX':
          case 'XXX': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
      x: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Hours and optional minutes
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xx`

          case 'xxxx':
          case 'xx':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xxx`

          case 'xxxxx':
          case 'xxx': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (GMT)
      O: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (specific non-location)
      z: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'z':
          case 'zz':
          case 'zzz':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'zzzz':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Seconds timestamp
      t: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = Math.floor(originalDate.getTime() / 1000);
        return addLeadingZeros(timestamp, token.length);
      },
      // Milliseconds timestamp
      T: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = originalDate.getTime();
        return addLeadingZeros(timestamp, token.length);
      }
    };

    function formatTimezoneShort(offset, dirtyDelimiter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;

      if (minutes === 0) {
        return sign + String(hours);
      }

      var delimiter = dirtyDelimiter || '';
      return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
    }

    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
      }

      return formatTimezone(offset, dirtyDelimiter);
    }

    function formatTimezone(offset, dirtyDelimiter) {
      var delimiter = dirtyDelimiter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
      var minutes = addLeadingZeros(absOffset % 60, 2);
      return sign + hours + delimiter + minutes;
    }

    function dateLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'P':
          return formatLong.date({
            width: 'short'
          });

        case 'PP':
          return formatLong.date({
            width: 'medium'
          });

        case 'PPP':
          return formatLong.date({
            width: 'long'
          });

        case 'PPPP':
        default:
          return formatLong.date({
            width: 'full'
          });
      }
    }

    function timeLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'p':
          return formatLong.time({
            width: 'short'
          });

        case 'pp':
          return formatLong.time({
            width: 'medium'
          });

        case 'ppp':
          return formatLong.time({
            width: 'long'
          });

        case 'pppp':
        default:
          return formatLong.time({
            width: 'full'
          });
      }
    }

    function dateTimeLongFormatter(pattern, formatLong) {
      var matchResult = pattern.match(/(P+)(p+)?/);
      var datePattern = matchResult[1];
      var timePattern = matchResult[2];

      if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
      }

      var dateTimeFormat;

      switch (datePattern) {
        case 'P':
          dateTimeFormat = formatLong.dateTime({
            width: 'short'
          });
          break;

        case 'PP':
          dateTimeFormat = formatLong.dateTime({
            width: 'medium'
          });
          break;

        case 'PPP':
          dateTimeFormat = formatLong.dateTime({
            width: 'long'
          });
          break;

        case 'PPPP':
        default:
          dateTimeFormat = formatLong.dateTime({
            width: 'full'
          });
          break;
      }

      return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
    }

    var longFormatters = {
      p: timeLongFormatter,
      P: dateTimeLongFormatter
    };

    var MILLISECONDS_IN_MINUTE = 60000;

    function getDateMillisecondsPart(date) {
      return date.getTime() % MILLISECONDS_IN_MINUTE;
    }
    /**
     * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
     * They usually appear for dates that denote time before the timezones were introduced
     * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
     * and GMT+01:00:00 after that date)
     *
     * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
     * which would lead to incorrect calculations.
     *
     * This function returns the timezone offset in milliseconds that takes seconds in account.
     */


    function getTimezoneOffsetInMilliseconds(dirtyDate) {
      var date = new Date(dirtyDate.getTime());
      var baseTimezoneOffset = Math.ceil(date.getTimezoneOffset());
      date.setSeconds(0, 0);
      var hasNegativeUTCOffset = baseTimezoneOffset > 0;
      var millisecondsPartOfTimezoneOffset = hasNegativeUTCOffset ? (MILLISECONDS_IN_MINUTE + getDateMillisecondsPart(date)) % MILLISECONDS_IN_MINUTE : getDateMillisecondsPart(date);
      return baseTimezoneOffset * MILLISECONDS_IN_MINUTE + millisecondsPartOfTimezoneOffset;
    }

    var protectedDayOfYearTokens = ['D', 'DD'];
    var protectedWeekYearTokens = ['YY', 'YYYY'];
    function isProtectedDayOfYearToken(token) {
      return protectedDayOfYearTokens.indexOf(token) !== -1;
    }
    function isProtectedWeekYearToken(token) {
      return protectedWeekYearTokens.indexOf(token) !== -1;
    }
    function throwProtectedError(token, format, input) {
      if (token === 'YYYY') {
        throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'YY') {
        throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'D') {
        throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'DD') {
        throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      }
    }

    // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
    //   (one of the certain letters followed by `o`)
    // - (\w)\1* matches any sequences of the same letter
    // - '' matches two quote characters in a row
    // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
    //   except a single quote symbol, which ends the sequence.
    //   Two quote characters do not end the sequence.
    //   If there is no matching single quote
    //   then the sequence will continue until the end of the string.
    // - . matches any single character unmatched by previous parts of the RegExps

    var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
    // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

    var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
    var escapedStringRegExp = /^'([^]*?)'?$/;
    var doubleQuoteRegExp = /''/g;
    var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
    /**
     * @name format
     * @category Common Helpers
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format. The result may vary by locale.
     *
     * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
     * > See: https://git.io/fxCyr
     *
     * The characters wrapped between two single quotes characters (') are escaped.
     * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
     * (see the last example)
     *
     * Format of the string is based on Unicode Technical Standard #35:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * with a few additions (see note 7 below the table).
     *
     * Accepted patterns:
     * | Unit                            | Pattern | Result examples                   | Notes |
     * |---------------------------------|---------|-----------------------------------|-------|
     * | Era                             | G..GGG  | AD, BC                            |       |
     * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
     * |                                 | GGGGG   | A, B                              |       |
     * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
     * |                                 | yy      | 44, 01, 00, 17                    | 5     |
     * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
     * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
     * |                                 | yyyyy   | ...                               | 3,5   |
     * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
     * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
     * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
     * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
     * |                                 | YYYYY   | ...                               | 3,5   |
     * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
     * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
     * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
     * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
     * |                                 | RRRRR   | ...                               | 3,5,7 |
     * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
     * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
     * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
     * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
     * |                                 | uuuuu   | ...                               | 3,5   |
     * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
     * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | QQ      | 01, 02, 03, 04                    |       |
     * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
     * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
     * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | qq      | 01, 02, 03, 04                    |       |
     * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
     * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
     * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | MM      | 01, 02, ..., 12                   |       |
     * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
     * |                                 | MMMM    | January, February, ..., December  | 2     |
     * |                                 | MMMMM   | J, F, ..., D                      |       |
     * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
     * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | LL      | 01, 02, ..., 12                   |       |
     * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
     * |                                 | LLLL    | January, February, ..., December  | 2     |
     * |                                 | LLLLL   | J, F, ..., D                      |       |
     * | Local week of year              | w       | 1, 2, ..., 53                     |       |
     * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | ww      | 01, 02, ..., 53                   |       |
     * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
     * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | II      | 01, 02, ..., 53                   | 7     |
     * | Day of month                    | d       | 1, 2, ..., 31                     |       |
     * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
     * |                                 | dd      | 01, 02, ..., 31                   |       |
     * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
     * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
     * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
     * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
     * |                                 | DDDD    | ...                               | 3     |
     * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
     * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
     * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
     * |                                 | ii      | 01, 02, ..., 07                   | 7     |
     * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
     * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
     * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
     * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
     * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
     * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | ee      | 02, 03, ..., 01                   |       |
     * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
     * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
     * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | cc      | 02, 03, ..., 01                   |       |
     * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
     * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | AM, PM                          | a..aaa  | AM, PM                            |       |
     * |                                 | aaaa    | a.m., p.m.                        | 2     |
     * |                                 | aaaaa   | a, p                              |       |
     * | AM, PM, noon, midnight          | b..bbb  | AM, PM, noon, midnight            |       |
     * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
     * |                                 | bbbbb   | a, p, n, mi                       |       |
     * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
     * |                                 | BBBB    | at night, in the morning, ...     | 2     |
     * |                                 | BBBBB   | at night, in the morning, ...     |       |
     * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
     * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
     * |                                 | hh      | 01, 02, ..., 11, 12               |       |
     * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
     * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
     * |                                 | HH      | 00, 01, 02, ..., 23               |       |
     * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
     * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
     * |                                 | KK      | 01, 02, ..., 11, 00               |       |
     * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
     * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
     * |                                 | kk      | 24, 01, 02, ..., 23               |       |
     * | Minute                          | m       | 0, 1, ..., 59                     |       |
     * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | mm      | 00, 01, ..., 59                   |       |
     * | Second                          | s       | 0, 1, ..., 59                     |       |
     * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | ss      | 00, 01, ..., 59                   |       |
     * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
     * |                                 | SS      | 00, 01, ..., 99                   |       |
     * |                                 | SSS     | 000, 0001, ..., 999               |       |
     * |                                 | SSSS    | ...                               | 3     |
     * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
     * |                                 | XX      | -0800, +0530, Z                   |       |
     * |                                 | XXX     | -08:00, +05:30, Z                 |       |
     * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
     * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
     * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
     * |                                 | xx      | -0800, +0530, +0000               |       |
     * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
     * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
     * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
     * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
     * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
     * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
     * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
     * | Seconds timestamp               | t       | 512969520                         | 7     |
     * |                                 | tt      | ...                               | 3,7   |
     * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
     * |                                 | TT      | ...                               | 3,7   |
     * | Long localized date             | P       | 05/29/1453                        | 7     |
     * |                                 | PP      | May 29, 1453                      | 7     |
     * |                                 | PPP     | May 29th, 1453                    | 7     |
     * |                                 | PPPP    | Sunday, May 29th, 1453            | 2,7   |
     * | Long localized time             | p       | 12:00 AM                          | 7     |
     * |                                 | pp      | 12:00:00 AM                       | 7     |
     * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
     * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
     * | Combination of date and time    | Pp      | 05/29/1453, 12:00 AM              | 7     |
     * |                                 | PPpp    | May 29, 1453, 12:00:00 AM         | 7     |
     * |                                 | PPPppp  | May 29th, 1453 at ...             | 7     |
     * |                                 | PPPPpppp| Sunday, May 29th, 1453 at ...     | 2,7   |
     * Notes:
     * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     *    are the same as "stand-alone" units, but are different in some languages.
     *    "Formatting" units are declined according to the rules of the language
     *    in the context of a date. "Stand-alone" units are always nominative singular:
     *
     *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     *
     *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     *
     * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     *    the single quote characters (see below).
     *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     *    the output will be the same as default pattern for this unit, usually
     *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     *    are marked with "2" in the last column of the table.
     *
     *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     *
     * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     *    The output will be padded with zeros to match the length of the pattern.
     *
     *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     *
     * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     *    These tokens represent the shortest form of the quarter.
     *
     * 5. The main difference between `y` and `u` patterns are B.C. years:
     *
     *    | Year | `y` | `u` |
     *    |------|-----|-----|
     *    | AC 1 |   1 |   1 |
     *    | BC 1 |   1 |   0 |
     *    | BC 2 |   2 |  -1 |
     *
     *    Also `yy` always returns the last two digits of a year,
     *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     *
     *    | Year | `yy` | `uu` |
     *    |------|------|------|
     *    | 1    |   01 |   01 |
     *    | 14   |   14 |   14 |
     *    | 376  |   76 |  376 |
     *    | 1453 |   53 | 1453 |
     *
     *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     *    except local week-numbering years are dependent on `options.weekStartsOn`
     *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     *
     * 6. Specific non-location timezones are currently unavailable in `date-fns`,
     *    so right now these tokens fall back to GMT timezones.
     *
     * 7. These patterns are not in the Unicode Technical Standard #35:
     *    - `i`: ISO day of week
     *    - `I`: ISO week of year
     *    - `R`: ISO week-numbering year
     *    - `t`: seconds timestamp
     *    - `T`: milliseconds timestamp
     *    - `o`: ordinal number modifier
     *    - `P`: long localized date
     *    - `p`: long localized time
     *
     * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
     *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
     *
     * 9. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
     *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - The second argument is now required for the sake of explicitness.
     *
     *   ```javascript
     *   // Before v2.0.0
     *   format(new Date(2016, 0, 1))
     *
     *   // v2.0.0 onward
     *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
     *   ```
     *
     * - New format string API for `format` function
     *   which is based on [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
     *   See [this post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
     *
     * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
     *
     * @param {Date|Number} date - the original date
     * @param {String} format - the string of tokens
     * @param {Object} [options] - an object with options.
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
     *   see: https://git.io/fxCyr
     * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
     *   see: https://git.io/fxCyr
     * @returns {String} the formatted date string
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `date` must not be Invalid Date
     * @throws {RangeError} `options.locale` must contain `localize` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
     * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
     * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} format string contains an unescaped latin alphabet character
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * var result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
     *   locale: eoLocale
     * })
     * //=> '2-a de julio 2014'
     *
     * @example
     * // Escape string by single quote characters:
     * var result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
     * //=> "3 o'clock"
     */

    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      requiredArgs(2, arguments);
      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var locale$1 = options.locale || locale;
      var localeFirstWeekContainsDate = locale$1.options && locale$1.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var localeWeekStartsOn = locale$1.options && locale$1.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      if (!locale$1.localize) {
        throw new RangeError('locale must contain localize property');
      }

      if (!locale$1.formatLong) {
        throw new RangeError('locale must contain formatLong property');
      }

      var originalDate = toDate(dirtyDate);

      if (!isValid(originalDate)) {
        throw new RangeError('Invalid time value');
      } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
      // This ensures that when UTC functions will be implemented, locales will be compatible with them.
      // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


      var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
      var utcDate = subMilliseconds(originalDate, timezoneOffset);
      var formatterOptions = {
        firstWeekContainsDate: firstWeekContainsDate,
        weekStartsOn: weekStartsOn,
        locale: locale$1,
        _originalDate: originalDate
      };
      var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
        var firstCharacter = substring[0];

        if (firstCharacter === 'p' || firstCharacter === 'P') {
          var longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale$1.formatLong, formatterOptions);
        }

        return substring;
      }).join('').match(formattingTokensRegExp).map(function (substring) {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return "'";
        }

        var firstCharacter = substring[0];

        if (firstCharacter === "'") {
          return cleanEscapedString(substring);
        }

        var formatter = formatters$1[firstCharacter];

        if (formatter) {
          if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          return formatter(utcDate, substring, locale$1.localize, formatterOptions);
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
        }

        return substring;
      }).join('');
      return result;
    }

    function cleanEscapedString(input) {
      return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
    }

    /* src/MessageList.svelte generated by Svelte v3.21.0 */
    const file$3 = "src/MessageList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (98:0) {#each chats as chat (chat.id)}
    function create_each_block(key_1, ctx) {
    	let article;
    	let div0;
    	let span0;
    	let t0_value = format(new Date(/*chat*/ ctx[4].created_at), "yyyy-MM-dd HH:mm:ss") + "";
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
    			add_location(span0, file$3, 100, 6, 2318);
    			attr_dev(span1, "class", "user svelte-n2su4y");
    			add_location(span1, file$3, 103, 6, 2425);
    			attr_dev(div0, "class", "meta svelte-n2su4y");
    			add_location(div0, file$3, 99, 4, 2293);
    			attr_dev(div1, "class", "msg svelte-n2su4y");
    			set_style(div1, "background-color", /*chat*/ ctx[4].user !== /*$user*/ ctx[1] && toHSL(/*chat*/ ctx[4].user));
    			add_location(div1, file$3, 105, 4, 2485);
    			attr_dev(article, "class", "svelte-n2su4y");
    			toggle_class(article, "user", /*chat*/ ctx[4].sender_type_text === "visitor");
    			add_location(article, file$3, 98, 2, 2230);
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
    			if (dirty & /*chats*/ 1 && t0_value !== (t0_value = format(new Date(/*chat*/ ctx[4].created_at), "yyyy-MM-dd HH:mm:ss") + "")) set_data_dev(t0, t0_value);
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
    		source: "(98:0) {#each chats as chat (chat.id)}",
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
    			if (dirty & /*chats, $user, toHSL, format, Date*/ 3) {
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
    		format,
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
    			attr_dev(button, "class", "svelte-1vidp0o");
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
    			attr_dev(span, "class", "svelte-1vidp0o");
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
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let current;
    	let if_block = /*showBack*/ ctx[0] && create_if_block$2(ctx);
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			add_location(div0, file$6, 27, 2, 645);
    			attr_dev(div1, "class", "dot svelte-1vidp0o");
    			add_location(div1, file$6, 30, 2, 675);
    			attr_dev(nav, "class", "svelte-1vidp0o");
    			add_location(nav, file$6, 7, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			if (if_block) if_block.m(nav, null);
    			append_dev(nav, t0);
    			append_dev(nav, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(nav, t1);
    			append_dev(nav, div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showBack*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(nav, t0);
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
    	let t15_value = "fdf5b42" + "";
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
    const file$9 = "src/App.svelte";

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
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let t2;
    	let div2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "客服名字";
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "Customer Support";
    			attr_dev(div0, "class", "assistant-avatar svelte-195u0mr");
    			add_location(div0, file$9, 34, 8, 994);
    			attr_dev(div1, "class", "text-white text-size-15 svelte-195u0mr");
    			add_location(div1, file$9, 36, 10, 1073);
    			attr_dev(div2, "class", "text-white-50 text-size-13 svelte-195u0mr");
    			add_location(div2, file$9, 37, 10, 1131);
    			attr_dev(div3, "class", "assistant-text svelte-195u0mr");
    			add_location(div3, file$9, 35, 8, 1034);
    			attr_dev(div4, "class", "assistant-info svelte-195u0mr");
    			add_location(div4, file$9, 33, 6, 957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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
    				unique_id: parseInt(Math.random() * 9999999).toString(),
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
