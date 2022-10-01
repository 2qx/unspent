
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (tls, net) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var tls__default = /*#__PURE__*/_interopDefaultLegacy(tls);
    var net__default = /*#__PURE__*/_interopDefaultLegacy(net);

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * Returns an array of incrementing values starting at `begin` and incrementing by one for `length`.
     *
     * E.g.: `range(3)` → `[0, 1, 2]` and `range(3, 1)` → `[1, 2, 3]`
     *
     * @param length - the number of elements in the array
     * @param begin - the index at which the range starts (default: `0`)
     */
    const range = (length, begin = 0) => Array.from({ length }, (_, index) => begin + index);
    /**
     * Split a string into an array of `chunkLength` strings. The final string may have a length between 1 and `chunkLength`.
     *
     * E.g.: `splitEvery('abcde', 2)` → `['ab', 'cd', 'e']`
     */
    const splitEvery = (input, chunkLength) => range(Math.ceil(input.length / chunkLength))
        .map((index) => index * chunkLength)
        .map((begin) => input.slice(begin, begin + chunkLength));
    const hexByteWidth = 2;
    const hexadecimal = 16;
    /**
     * Decode a hexadecimal-encoded string into a Uint8Array.
     *
     * E.g.: `hexToBin('2a64ff')` → `new Uint8Array([42, 100, 255])`
     *
     * Note, this method always completes. If `validHex` is not divisible by 2,
     * the final byte will be parsed as if it were prepended with a `0` (e.g. `aaa`
     * is interpreted as `aa0a`). If `validHex` is potentially malformed, check
     * it with `isHex` before calling this method.
     *
     * @param validHex - a string of valid, hexadecimal-encoded data
     */
    const hexToBin = (validHex) => Uint8Array.from(splitEvery(validHex, hexByteWidth).map((byte) => parseInt(byte, hexadecimal)));
    /**
     * Encode a Uint8Array into a hexadecimal-encoded string.
     *
     * E.g.: `binToHex(new Uint8Array([42, 100, 255]))` → `'2a64ff'`
     *
     * @param bytes - a Uint8Array to encode
     */
    const binToHex = (bytes) => bytes.reduce((str, byte) => str + byte.toString(hexadecimal).padStart(hexByteWidth, '0'), '');
    /**
     * Reduce an array of `Uint8Array`s into a single `Uint8Array`.
     * @param array - the array of `Uint8Array`s to flatten
     */
    const flattenBinArray = (array) => {
        const totalLength = array.reduce((total, bin) => total + bin.length, 0);
        const flattened = new Uint8Array(totalLength);
        // eslint-disable-next-line functional/no-expression-statement
        array.reduce((index, bin) => {
            // eslint-disable-next-line functional/no-expression-statement
            flattened.set(bin, index);
            return index + bin.length;
        }, 0);
        return flattened;
    };

    var BaseConversionError;
    (function (BaseConversionError) {
        BaseConversionError["tooLong"] = "An alphabet may be no longer than 254 characters.";
        BaseConversionError["ambiguousCharacter"] = "A character code may only appear once in a single alphabet.";
        BaseConversionError["unknownCharacter"] = "Encountered an unknown character for this alphabet.";
    })(BaseConversionError || (BaseConversionError = {}));
    /**
     * Create a `BaseConverter`, which exposes methods for encoding and decoding
     * `Uint8Array`s using bitcoin-style padding: each leading zero in the input is
     * replaced with the zero-index character of the `alphabet`, then the remainder
     * of the input is encoded as a large number in the specified alphabet.
     *
     * For example, using the alphabet `01`, the input `[0, 15]` is encoded `01111`
     * – a single `0` represents the leading padding, followed by the base2 encoded
     * `0x1111` (15). With the same alphabet, the input `[0, 0, 255]` is encoded
     * `0011111111` - only two `0` characters are required to represent both
     * leading zeros, followed by the base2 encoded `0x11111111` (255).
     *
     * **This is not compatible with `RFC 3548`'s `Base16`, `Base32`, or `Base64`.**
     *
     * If the alphabet is malformed, this method returns the error as a `string`.
     *
     * @param alphabet - an ordered string which maps each index to a character,
     * e.g. `0123456789`.
     * @privateRemarks
     * Algorithm from the `base-x` implementation (which is derived from the
     * original Satoshi implementation): https://github.com/cryptocoinjs/base-x
     */
    const createBaseConverter = (alphabet) => {
        const undefinedValue = 255;
        const uint8ArrayBase = 256;
        if (alphabet.length >= undefinedValue)
            return BaseConversionError.tooLong;
        const alphabetMap = new Uint8Array(uint8ArrayBase).fill(undefinedValue);
        // eslint-disable-next-line functional/no-loop-statement, functional/no-let, no-plusplus
        for (let index = 0; index < alphabet.length; index++) {
            const characterCode = alphabet.charCodeAt(index);
            if (alphabetMap[characterCode] !== undefinedValue) {
                return BaseConversionError.ambiguousCharacter;
            }
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            alphabetMap[characterCode] = index;
        }
        const base = alphabet.length;
        const paddingCharacter = alphabet.charAt(0);
        const factor = Math.log(base) / Math.log(uint8ArrayBase);
        const inverseFactor = Math.log(uint8ArrayBase) / Math.log(base);
        return {
            // eslint-disable-next-line complexity
            decode: (input) => {
                if (input.length === 0)
                    return Uint8Array.of();
                const firstNonZeroIndex = input
                    .split('')
                    .findIndex((character) => character !== paddingCharacter);
                if (firstNonZeroIndex === -1) {
                    return new Uint8Array(input.length);
                }
                const requiredLength = Math.floor((input.length - firstNonZeroIndex) * factor + 1);
                const decoded = new Uint8Array(requiredLength);
                /* eslint-disable functional/no-let, functional/no-expression-statement */
                let nextByte = firstNonZeroIndex;
                let remainingBytes = 0;
                // eslint-disable-next-line functional/no-loop-statement
                while (input[nextByte] !== undefined) {
                    let carry = alphabetMap[input.charCodeAt(nextByte)];
                    if (carry === undefinedValue)
                        return BaseConversionError.unknownCharacter;
                    let digit = 0;
                    // eslint-disable-next-line functional/no-loop-statement
                    for (let steps = requiredLength - 1; (carry !== 0 || digit < remainingBytes) && steps !== -1; 
                    // eslint-disable-next-line no-plusplus
                    steps--, digit++) {
                        carry += Math.floor(base * decoded[steps]);
                        // eslint-disable-next-line functional/immutable-data
                        decoded[steps] = Math.floor(carry % uint8ArrayBase);
                        carry = Math.floor(carry / uint8ArrayBase);
                    }
                    remainingBytes = digit;
                    // eslint-disable-next-line no-plusplus
                    nextByte++;
                }
                /* eslint-enable functional/no-let, functional/no-expression-statement */
                const firstNonZeroResultDigit = decoded.findIndex((value) => value !== 0);
                const bin = new Uint8Array(firstNonZeroIndex + (requiredLength - firstNonZeroResultDigit));
                // eslint-disable-next-line functional/no-expression-statement
                bin.set(decoded.slice(firstNonZeroResultDigit), firstNonZeroIndex);
                return bin;
            },
            // eslint-disable-next-line complexity
            encode: (input) => {
                if (input.length === 0)
                    return '';
                const firstNonZeroIndex = input.findIndex((byte) => byte !== 0);
                if (firstNonZeroIndex === -1) {
                    return paddingCharacter.repeat(input.length);
                }
                const requiredLength = Math.floor((input.length - firstNonZeroIndex) * inverseFactor + 1);
                const encoded = new Uint8Array(requiredLength);
                /* eslint-disable functional/no-let, functional/no-expression-statement */
                let nextByte = firstNonZeroIndex;
                let remainingBytes = 0;
                // eslint-disable-next-line functional/no-loop-statement
                while (nextByte !== input.length) {
                    let carry = input[nextByte];
                    let digit = 0;
                    // eslint-disable-next-line functional/no-loop-statement
                    for (let steps = requiredLength - 1; (carry !== 0 || digit < remainingBytes) && steps !== -1; 
                    // eslint-disable-next-line no-plusplus
                    steps--, digit++) {
                        carry += Math.floor(uint8ArrayBase * encoded[steps]);
                        // eslint-disable-next-line functional/immutable-data
                        encoded[steps] = Math.floor(carry % base);
                        carry = Math.floor(carry / base);
                    }
                    remainingBytes = digit;
                    // eslint-disable-next-line no-plusplus
                    nextByte++;
                }
                /* eslint-enable functional/no-let, functional/no-expression-statement */
                const firstNonZeroResultDigit = encoded.findIndex((value) => value !== 0);
                const padding = paddingCharacter.repeat(firstNonZeroIndex);
                return encoded
                    .slice(firstNonZeroResultDigit)
                    .reduce((all, digit) => all + alphabet.charAt(digit), padding);
            },
        };
    };
    const bitcoinBase58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const base58 = createBaseConverter(bitcoinBase58Alphabet);
    /**
     * Convert a bitcoin-style base58-encoded string to a Uint8Array.
     *
     * See `createBaseConverter` for format details.
     * @param input - a valid base58-encoded string to decode
     */
    const base58ToBin = base58.decode;
    /**
     * Convert a Uint8Array to a bitcoin-style base58-encoded string.
     *
     * See `createBaseConverter` for format details.
     * @param input - the Uint8Array to base58 encode
     */
    base58.encode;

    // base64 encode/decode derived from: https://github.com/niklasvh/base64-arraybuffer
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    /* eslint-disable functional/no-expression-statement, functional/immutable-data, @typescript-eslint/no-magic-numbers, no-bitwise, no-plusplus */
    /**
     * Convert a base64-encoded string to a Uint8Array.
     *
     * Note, this method always completes. If `validBase64` is not valid base64, an
     * incorrect result will be returned. If `validBase64` is potentially malformed,
     * check it with `isBase64` before calling this method.
     *
     * @param validBase64 - a valid base64-encoded string to decode
     */
    const base64ToBin = (validBase64) => {
        const lookup = new Uint8Array(123);
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement
        for (let i = 0; i < chars.length; i++) {
            lookup[chars.charCodeAt(i)] = i;
        }
        const bufferLengthEstimate = validBase64.length * 0.75;
        const stringLength = validBase64.length;
        const bufferLength = validBase64[validBase64.length - 1] === '=' // eslint-disable-line @typescript-eslint/prefer-string-starts-ends-with
            ? validBase64[validBase64.length - 2] === '='
                ? bufferLengthEstimate - 2
                : bufferLengthEstimate - 1
            : bufferLengthEstimate;
        const buffer = new ArrayBuffer(bufferLength);
        const bytes = new Uint8Array(buffer);
        // eslint-disable-next-line functional/no-let
        let p = 0;
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement
        for (let i = 0; i < stringLength; i += 4) {
            const encoded1 = lookup[validBase64.charCodeAt(i)];
            const encoded2 = lookup[validBase64.charCodeAt(i + 1)];
            const encoded3 = lookup[validBase64.charCodeAt(i + 2)];
            const encoded4 = lookup[validBase64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return bytes;
    };
    /* eslint-enable functional/no-expression-statement, functional/immutable-data, @typescript-eslint/no-magic-numbers, no-bitwise, no-plusplus */

    /**
     * Encode a positive integer as a little-endian Uint8Array. For values exceeding
     * `Number.MAX_SAFE_INTEGER` (`9007199254740991`), use `bigIntToBinUintLE`.
     * Negative values will return the same result as `0`.
     *
     * @param value - the number to encode
     */
    const numberToBinUintLE = (value) => {
        const baseUint8Array = 256;
        const result = [];
        // eslint-disable-next-line functional/no-let
        let remaining = value;
        // eslint-disable-next-line functional/no-loop-statement
        while (remaining >= baseUint8Array) {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            result.push(remaining % baseUint8Array);
            // eslint-disable-next-line functional/no-expression-statement
            remaining = Math.floor(remaining / baseUint8Array);
        }
        // eslint-disable-next-line functional/no-conditional-statement, functional/no-expression-statement, functional/immutable-data
        if (remaining > 0)
            result.push(remaining);
        return Uint8Array.from(result);
    };
    /**
     * Fill a new Uint8Array of a specific byte-length with the contents of a given
     * Uint8Array, truncating or padding the Uint8Array with zeros.
     *
     * @param bin - the Uint8Array to resize
     * @param bytes - the desired byte-length
     */
    const binToFixedLength = (bin, bytes) => {
        const fixedBytes = new Uint8Array(bytes);
        const maxValue = 255;
        // eslint-disable-next-line functional/no-expression-statement
        bin.length > bytes ? fixedBytes.fill(maxValue) : fixedBytes.set(bin);
        // TODO: re-enable eslint-disable-next-line @typescript-eslint/no-unused-expressions
        return fixedBytes;
    };
    /**
     * Encode a positive integer as a 2-byte Uint16LE Uint8Array.
     *
     * This method will return an incorrect result for values outside of the range
     * `0` to `0xffff`.
     *
     * @param value - the number to encode
     */
    const numberToBinUint16LE = (value) => {
        const uint16Length = 2;
        const bin = new Uint8Array(uint16Length);
        const writeAsLittleEndian = true;
        const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
        // eslint-disable-next-line functional/no-expression-statement
        view.setUint16(0, value, writeAsLittleEndian);
        return bin;
    };
    /**
     * Encode a positive number as a 4-byte Uint32LE Uint8Array.
     *
     * This method will return an incorrect result for values outside of the range
     * `0` to `0xffffffff`.
     *
     * @param value - the number to encode
     */
    const numberToBinUint32LE = (value) => {
        const uint32Length = 4;
        const bin = new Uint8Array(uint32Length);
        const writeAsLittleEndian = true;
        const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
        // eslint-disable-next-line functional/no-expression-statement
        view.setUint32(0, value, writeAsLittleEndian);
        return bin;
    };
    /**
     * Encode a positive BigInt as little-endian Uint8Array. Negative values will
     * return the same result as `0`.
     *
     * @param value - the number to encode
     */
    const bigIntToBinUintLE = (value) => {
        const baseUint8Array = 256;
        const base = BigInt(baseUint8Array);
        const result = [];
        // eslint-disable-next-line functional/no-let
        let remaining = value;
        // eslint-disable-next-line functional/no-loop-statement
        while (remaining >= base) {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            result.push(Number(remaining % base));
            // eslint-disable-next-line functional/no-expression-statement
            remaining /= base;
        }
        // eslint-disable-next-line functional/no-conditional-statement, functional/no-expression-statement, functional/immutable-data
        if (remaining > BigInt(0))
            result.push(Number(remaining));
        return Uint8Array.from(result.length > 0 ? result : [0]);
    };
    /**
     * Encode a positive BigInt as an 8-byte Uint64LE Uint8Array, clamping the
     * results. (Values exceeding `0xffff_ffff_ffff_ffff` return the same result as
     * `0xffff_ffff_ffff_ffff`, negative values return the same result as `0`.)
     *
     * @param value - the number to encode
     */
    const bigIntToBinUint64LEClamped = (value) => {
        const uint64 = 8;
        return binToFixedLength(bigIntToBinUintLE(value), uint64);
    };
    /**
     * Encode a positive BigInt as an 8-byte Uint64LE Uint8Array.
     *
     * This method will return an incorrect result for values outside of the range
     * `0` to `0xffff_ffff_ffff_ffff`.
     *
     * @param value - the number to encode
     */
    const bigIntToBinUint64LE = (value) => {
        const uint64LengthInBits = 64;
        const valueAsUint64 = BigInt.asUintN(uint64LengthInBits, value);
        const fixedLengthBin = bigIntToBinUint64LEClamped(valueAsUint64);
        return fixedLengthBin;
    };
    /**
     * Decode a little-endian Uint8Array of any length into a number. For numbers
     * larger than `Number.MAX_SAFE_INTEGER` (`9007199254740991`), use
     * `binToBigIntUintLE`.
     *
     * The `bytes` parameter can be set to constrain the expected length (default:
     * `bin.length`). This method throws if `bin.length` is not equal to `bytes`.
     *
     * @privateRemarks
     * We avoid a bitwise strategy here because JavaScript uses 32-bit signed
     * integers for bitwise math, so larger numbers are converted incorrectly. E.g.
     * `2147483648 << 8` is `0`, while `2147483648n << 8n` is `549755813888n`.
     *
     * @param bin - the Uint8Array to decode
     * @param bytes - the number of bytes to read (default: `bin.length`)
     */
    const binToNumberUintLE = (bin, bytes = bin.length) => {
        const base = 2;
        const bitsInAByte = 8;
        // eslint-disable-next-line functional/no-conditional-statement
        if (bin.length !== bytes) {
            // eslint-disable-next-line functional/no-throw-statement
            throw new TypeError(`Bin length must be ${bytes}.`);
        }
        return new Uint8Array(bin.buffer, bin.byteOffset, bin.length).reduce((accumulated, byte, i) => accumulated + byte * base ** (bitsInAByte * i), 0);
    };
    /**
     * Decode a 4-byte Uint32LE Uint8Array into a number.
     *
     * Throws if `bin` is shorter than 4 bytes.
     *
     * @param bin - the Uint8Array to decode
     */
    const binToNumberUint32LE = (bin) => {
        const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
        const readAsLittleEndian = true;
        return view.getUint32(0, readAsLittleEndian);
    };
    /**
     * Decode a little-endian Uint8Array of any length into a BigInt.
     *
     * The `bytes` parameter can be set to constrain the expected length (default:
     * `bin.length`). This method throws if `bin.length` is not equal to `bytes`.
     *
     * @param bin - the Uint8Array to decode
     * @param bytes - the number of bytes to read (default: `bin.length`)
     */
    const binToBigIntUintLE = (bin, bytes = bin.length) => {
        const bitsInAByte = 8;
        // eslint-disable-next-line functional/no-conditional-statement
        if (bin.length !== bytes) {
            // eslint-disable-next-line functional/no-throw-statement
            throw new TypeError(`Bin length must be ${bytes}.`);
        }
        return new Uint8Array(bin.buffer, bin.byteOffset, bin.length).reduceRight(
        // eslint-disable-next-line no-bitwise
        (accumulated, byte) => (accumulated << BigInt(bitsInAByte)) | BigInt(byte), BigInt(0));
    };
    /**
     * Get the expected byte length of a Bitcoin VarInt given a first byte.
     *
     * @param firstByte - the first byte of the VarInt
     */
    const varIntPrefixToSize = (firstByte) => {
        const uint8 = 1;
        const uint16 = 2;
        const uint32 = 4;
        const uint64 = 8;
        switch (firstByte) {
            case 253 /* uint16Prefix */:
                return uint16 + 1;
            case 254 /* uint32Prefix */:
                return uint32 + 1;
            case 255 /* uint64Prefix */:
                return uint64 + 1;
            default:
                return uint8;
        }
    };
    /**
     * Read a Bitcoin VarInt (Variable-length integer) from a Uint8Array, returning
     * the `nextOffset` after the VarInt and the value as a BigInt.
     *
     * @param bin - the Uint8Array from which to read the VarInt
     * @param offset - the offset at which the VarInt begins
     */
    const readBitcoinVarInt = (bin, offset = 0) => {
        const bytes = varIntPrefixToSize(bin[offset]);
        const hasPrefix = bytes !== 1;
        return {
            nextOffset: offset + bytes,
            value: hasPrefix
                ? binToBigIntUintLE(bin.subarray(offset + 1, offset + bytes), bytes - 1)
                : binToBigIntUintLE(bin.subarray(offset, offset + bytes), 1),
        };
    };
    /**
     * Encode a positive BigInt as a Bitcoin VarInt (Variable-length integer).
     *
     * Note: the maximum value of a Bitcoin VarInt is `0xffff_ffff_ffff_ffff`. This
     * method will return an incorrect result for values outside of the range `0` to
     * `0xffff_ffff_ffff_ffff`.
     *
     * @param value - the BigInt to encode (no larger than `0xffff_ffff_ffff_ffff`)
     */
    const bigIntToBitcoinVarInt = (value) => value <= BigInt(252 /* uint8MaxValue */)
        ? Uint8Array.of(Number(value))
        : value <= BigInt(65535 /* uint16MaxValue */)
            ? Uint8Array.from([
                253 /* uint16Prefix */,
                ...numberToBinUint16LE(Number(value)),
            ])
            : value <= BigInt(4294967295 /* uint32MaxValue */)
                ? Uint8Array.from([
                    254 /* uint32Prefix */,
                    ...numberToBinUint32LE(Number(value)),
                ])
                : Uint8Array.from([255 /* uint64Prefix */, ...bigIntToBinUint64LE(value)]);

    /**
     * This implementations is derived from:
     * https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js
     *
     * Copyright 2008 The Closure Library Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /* eslint-disable complexity, functional/no-let, functional/immutable-data, no-bitwise, @typescript-eslint/no-magic-numbers, functional/no-expression-statement, functional/no-conditional-statement, functional/no-loop-statement, no-plusplus */
    /**
     * Interpret a string as UTF-8 and encode it as a Uint8Array.
     * @param utf8 - the string to encode
     */
    const utf8ToBin = (utf8) => {
        const out = [];
        let p = 0;
        for (let i = 0; i < utf8.length; i++) {
            let c = utf8.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            }
            else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            }
            else if ((c & 0xfc00) === 0xd800 &&
                i + 1 < utf8.length &&
                (utf8.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                c = ((c & 0x03ff) << 10) + 0x10000 + (utf8.charCodeAt((i += 1)) & 0x03ff);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
            else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return new Uint8Array(out);
    };

    /**
     * Base58 version byte values for common Base58Address format versions.
     */
    var Base58AddressFormatVersion;
    (function (Base58AddressFormatVersion) {
        /**
         * A Pay to Public Key Hash (P2PKH) address – base58 encodes to a leading `1`.
         *
         * Hex: `0x00`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["p2pkh"] = 0] = "p2pkh";
        /**
         * A Pay to Script Hash (P2SH) address – base58 encodes to a leading `3`.
         *
         * Hex: `0x05`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["p2sh"] = 5] = "p2sh";
        /**
         * A private key in Wallet Import Format. For private keys used with
         * uncompressed public keys, the payload is 32 bytes and causes the version
         * to be encoded as a `5`. For private keys used with compressed public keys,
         * a final `0x01` byte is appended to the private key, increasing the payload
         * to 33 bytes, and causing the version to be encoded as a `K` or `L`.
         *
         * Hex: `0x80`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["wif"] = 128] = "wif";
        /**
         * A testnet Pay to Public Key Hash (P2PKH) address – base58 encodes to a
         * leading `m` or `n`.
         *
         * Hex: `0x6f`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["p2pkhTestnet"] = 111] = "p2pkhTestnet";
        /**
         * A testnet Pay to Script Hash (P2SH) address – base58 encodes to a leading
         * `2`.
         *
         * Hex: `0xc4`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["p2shTestnet"] = 196] = "p2shTestnet";
        /**
         * A private key in Wallet Import Format intended for testnet use. For private
         * keys used with uncompressed public keys, the payload is 32 bytes and causes
         * the version to be encoded as a `9`. For private keys used with compressed
         * public keys, a final `0x01` byte is appended to the private key, increasing
         * the payload to 33 bytes, and causing the version to be encoded as a `c`.
         *
         * Hex: `0xef`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["wifTestnet"] = 239] = "wifTestnet";
        /**
         * A Pay to Public Key Hash (P2PKH) address intended for use on the Bitcoin
         * Cash network – base58 encodes to a leading `C`. This version was
         * temporarily used by the Copay project before the CashAddress format was
         * standardized.
         *
         * Hex: `0x1c`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["p2pkhCopayBCH"] = 28] = "p2pkhCopayBCH";
        /**
         * A Pay to Script Hash (P2SH) address intended for use on the Bitcoin
         * Cash network – base58 encodes to a leading `H`. This version was
         * temporarily used by the Copay project before the CashAddress format was
         * standardized.
         *
         * Hex: `0x28`
         */
        Base58AddressFormatVersion[Base58AddressFormatVersion["p2shCopayBCH"] = 40] = "p2shCopayBCH";
    })(Base58AddressFormatVersion || (Base58AddressFormatVersion = {}));
    var Base58AddressError;
    (function (Base58AddressError) {
        Base58AddressError["unknownCharacter"] = "Base58Address error: address may only contain valid base58 characters.";
        Base58AddressError["tooShort"] = "Base58Address error: address is too short to be valid.";
        Base58AddressError["invalidChecksum"] = "Base58Address error: address has an invalid checksum.";
        Base58AddressError["unknownAddressVersion"] = "Base58Address error: address uses an unknown address version.";
        Base58AddressError["incorrectLength"] = "Base58Address error: the encoded payload is not the correct length (20 bytes).";
    })(Base58AddressError || (Base58AddressError = {}));
    /**
     * Attempt to decode a Base58Address-formatted string. This is more lenient than
     * `decodeCashAddress`, which also validates the address version.
     *
     * Returns the contents of the address or an error message as a string.
     *
     * @param sha256 - an implementation of sha256 (a universal implementation is
     * available via `instantiateSha256`)
     * @param address - the string to decode as a base58 address
     */
    const decodeBase58AddressFormat = (sha256, address) => {
        const checksumBytes = 4;
        const bin = base58ToBin(address);
        if (bin === BaseConversionError.unknownCharacter) {
            return Base58AddressError.unknownCharacter;
        }
        const minimumBase58AddressLength = 5;
        if (bin.length < minimumBase58AddressLength) {
            return Base58AddressError.tooShort;
        }
        const content = bin.slice(0, -checksumBytes);
        const checksum = bin.slice(-checksumBytes);
        const expectedChecksum = sha256
            .hash(sha256.hash(content))
            .slice(0, checksumBytes);
        if (!checksum.every((value, i) => value === expectedChecksum[i])) {
            return Base58AddressError.invalidChecksum;
        }
        return {
            payload: content.slice(1),
            version: content[0],
        };
    };

    /**
     * The list of 32 symbols used in Bech32 encoding.
     */
    // cspell: disable-next-line
    const bech32CharacterSet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    /**
     * An object mapping each of the 32 symbols used in Bech32 encoding to their respective index in the character set.
     */
    // prettier-ignore
    const bech32CharacterSetIndex = { q: 0, p: 1, z: 2, r: 3, y: 4, '9': 5, x: 6, '8': 7, g: 8, f: 9, '2': 10, t: 11, v: 12, d: 13, w: 14, '0': 15, s: 16, '3': 17, j: 18, n: 19, '5': 20, '4': 21, k: 22, h: 23, c: 24, e: 25, '6': 26, m: 27, u: 28, a: 29, '7': 30, l: 31 }; // eslint-disable-line sort-keys
    var BitRegroupingError;
    (function (BitRegroupingError) {
        BitRegroupingError["integerOutOfRange"] = "An integer provided in the source array is out of the range of the specified source word length.";
        BitRegroupingError["hasDisallowedPadding"] = "Encountered padding when padding was disallowed.";
        BitRegroupingError["requiresDisallowedPadding"] = "Encoding requires padding while padding is disallowed.";
    })(BitRegroupingError || (BitRegroupingError = {}));
    /* eslint-disable functional/no-let, no-bitwise, functional/no-expression-statement, functional/no-conditional-statement, complexity */
    /**
     * Given an array of integers, regroup bits from `sourceWordLength` to
     * `resultWordLength`, returning a new array of integers between 0 and
     * toWordLength^2.
     *
     * Note, if `bin` is within the range of `sourceWordLength` and `padding` is
     * `true`, this method will never error.
     *
     * A.K.A. `convertbits`
     *
     * @param bin - an array of numbers representing the bits to regroup. Each item
     * must be a number within the range of `sourceWordLength`
     * @param sourceWordLength - the bit-length of each number in `bin`, e.g. to
     * regroup bits from a `Uint8Array`, use `8` (must be a positive integer)
     * @param resultWordLength - the bit-length of each number in the desired result
     * array, e.g. to regroup bits into 4-bit numbers, use `4` (must be a positive
     * integer)
     * @param allowPadding - whether to allow the use of padding for `bin` values
     * where the provided number of bits cannot be directly mapped to an equivalent
     * result array (remaining bits are filled with `0`), defaults to `true`
     * @privateRemarks
     * Derived from: https://github.com/sipa/bech32
     */
    const regroupBits = ({ bin, sourceWordLength, resultWordLength, allowPadding = true, }) => {
        let accumulator = 0;
        let bits = 0;
        const result = [];
        const maxResultInt = (1 << resultWordLength) - 1;
        // eslint-disable-next-line functional/no-loop-statement, @typescript-eslint/prefer-for-of, no-plusplus
        for (let p = 0; p < bin.length; ++p) {
            const value = bin[p];
            if (value < 0 || value >> sourceWordLength !== 0) {
                return BitRegroupingError.integerOutOfRange;
            }
            accumulator = (accumulator << sourceWordLength) | value;
            bits += sourceWordLength;
            // eslint-disable-next-line functional/no-loop-statement
            while (bits >= resultWordLength) {
                bits -= resultWordLength;
                // eslint-disable-next-line functional/immutable-data
                result.push((accumulator >> bits) & maxResultInt);
            }
        }
        if (allowPadding) {
            if (bits > 0) {
                // eslint-disable-next-line functional/immutable-data
                result.push((accumulator << (resultWordLength - bits)) & maxResultInt);
            }
        }
        else if (bits >= sourceWordLength) {
            return BitRegroupingError.hasDisallowedPadding;
        }
        else if (((accumulator << (resultWordLength - bits)) & maxResultInt) > 0) {
            return BitRegroupingError.requiresDisallowedPadding;
        }
        return result;
    };
    /* eslint-enable functional/no-let, no-bitwise, functional/no-expression-statement, functional/no-conditional-statement, complexity */
    /**
     * Encode an array of numbers as a base32 string using the Bech32 character set.
     *
     * Note, this method always completes. For a valid result, all items in
     * `base32IntegerArray` must be between `0` and `32`.
     *
     * @param base32IntegerArray - the array of 5-bit integers to encode
     */
    const encodeBech32 = (base32IntegerArray) => {
        // eslint-disable-next-line functional/no-let
        let result = '';
        // eslint-disable-next-line @typescript-eslint/prefer-for-of, functional/no-let, functional/no-loop-statement, no-plusplus
        for (let i = 0; i < base32IntegerArray.length; i++) {
            // eslint-disable-next-line functional/no-expression-statement
            result += bech32CharacterSet[base32IntegerArray[i]];
        }
        return result;
    };
    /**
     * Decode a Bech32-encoded string into an array of 5-bit integers.
     *
     * Note, this method always completes. If `validBech32` is not valid bech32,
     * an incorrect result will be returned. If `validBech32` is potentially
     * malformed, check it with `isBech32` before calling this method.
     *
     * @param validBech32 - the bech32-encoded string to decode
     */
    const decodeBech32 = (validBech32) => {
        const result = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of, functional/no-let, functional/no-loop-statement, no-plusplus
        for (let i = 0; i < validBech32.length; i++) {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            result.push(bech32CharacterSetIndex[validBech32[i]]);
        }
        return result;
    };
    const nonBech32Characters = new RegExp(`[^${bech32CharacterSet}]`, 'u');
    /**
     * Validate that a string uses only characters from the bech32 character set.
     *
     * @param maybeBech32 - a string to test for valid Bech32 encoding
     */
    const isBech32CharacterSet = (maybeBech32) => !nonBech32Characters.test(maybeBech32);
    var Bech32DecodingError;
    (function (Bech32DecodingError) {
        Bech32DecodingError["notBech32CharacterSet"] = "Bech32 decoding error: input contains characters outside of the Bech32 character set.";
    })(Bech32DecodingError || (Bech32DecodingError = {}));

    var CashAddressNetworkPrefix;
    (function (CashAddressNetworkPrefix) {
        CashAddressNetworkPrefix["mainnet"] = "bitcoincash";
        CashAddressNetworkPrefix["testnet"] = "bchtest";
        CashAddressNetworkPrefix["regtest"] = "bchreg";
    })(CashAddressNetworkPrefix || (CashAddressNetworkPrefix = {}));
    const cashAddressBitToSize = {
        0: 160,
        1: 192,
        2: 224,
        3: 256,
        4: 320,
        5: 384,
        6: 448,
        7: 512,
    };
    const cashAddressSizeToBit = {
        160: 0,
        192: 1,
        224: 2,
        256: 3,
        320: 4,
        384: 5,
        448: 6,
        512: 7,
    };
    /**
     * The CashAddress specification standardizes the format of the version byte:
     * - Most significant bit: reserved, must be `0`
     * - next 4 bits: Address Type
     * - 3 least significant bits: Hash Size
     *
     * Only two Address Type values are currently standardized:
     * - 0 (`0b0000`): P2PKH
     * - 1 (`0b0001`): P2SH
     *
     * While both P2PKH and P2SH addresses always use 160 bit hashes, the
     * CashAddress specification standardizes other sizes for future use (or use by
     * other systems), see `CashAddressSizeBit`.
     *
     * With these constraints, only two version byte values are currently standard.
     */
    var CashAddressVersionByte;
    (function (CashAddressVersionByte) {
        /**
         * Pay to Public Key Hash (P2PKH): `0b00000000`
         *
         * - Most significant bit: `0` (reserved)
         * - Address Type bits: `0000` (P2PKH)
         * - Size bits: `000` (160 bits)
         */
        CashAddressVersionByte[CashAddressVersionByte["P2PKH"] = 0] = "P2PKH";
        /**
         * Pay to Script Hash (P2SH): `0b00001000`
         *
         * - Most significant bit: `0` (reserved)
         * - Address Type bits: `0001` (P2SH)
         * - Size bits: `000` (160 bits)
         */
        CashAddressVersionByte[CashAddressVersionByte["P2SH"] = 8] = "P2SH";
    })(CashAddressVersionByte || (CashAddressVersionByte = {}));
    /**
     * The address types currently defined in the CashAddress specification. See
     * also: `CashAddressVersionByte`.
     */
    var CashAddressType;
    (function (CashAddressType) {
        /**
         * Pay to Public Key Hash (P2PKH)
         */
        CashAddressType[CashAddressType["P2PKH"] = 0] = "P2PKH";
        /**
         * Pay to Script Hash (P2SH)
         */
        CashAddressType[CashAddressType["P2SH"] = 1] = "P2SH";
    })(CashAddressType || (CashAddressType = {}));
    const cashAddressTypeBitShift = 3;
    /**
     * Encode a CashAddress version byte for the given address type and hash length.
     * See `CashAddressVersionByte` for more information.
     *
     * The `type` parameter must be a number between `0` and `15`, and `bitLength`
     * must be one of the standardized lengths. To use the contents of a variable,
     * cast it to `CashAddressType` or `CashAddressSize` respectively, e.g.:
     * ```ts
     * const type = 3 as CashAddressType;
     * const size = 160 as CashAddressSize;
     * getCashAddressVersionByte(type, size);
     * ```
     * @param type - the address type of the hash being encoded
     * @param bitLength - the bit length of the hash being encoded
     */
    const encodeCashAddressVersionByte = (type, bitLength
    // eslint-disable-next-line no-bitwise
    ) => (type << cashAddressTypeBitShift) | cashAddressSizeToBit[bitLength];
    const cashAddressReservedBitMask = 0b10000000;
    const cashAddressTypeBits = 0b1111;
    const cashAddressSizeBits = 0b111;
    const empty = 0;
    var CashAddressVersionByteDecodingError;
    (function (CashAddressVersionByteDecodingError) {
        CashAddressVersionByteDecodingError["reservedBitSet"] = "Reserved bit is set.";
    })(CashAddressVersionByteDecodingError || (CashAddressVersionByteDecodingError = {}));
    /**
     * Decode a CashAddress version byte.
     * @param version - the version byte to decode
     */
    const decodeCashAddressVersionByte = (version) => 
    // eslint-disable-next-line no-negated-condition, no-bitwise
    (version & cashAddressReservedBitMask) !== empty
        ? CashAddressVersionByteDecodingError.reservedBitSet
        : {
            bitLength: cashAddressBitToSize[
            // eslint-disable-next-line no-bitwise
            (version & cashAddressSizeBits)],
            // eslint-disable-next-line no-bitwise
            type: (version >>> cashAddressTypeBitShift) & cashAddressTypeBits,
        };
    /**
     * In ASCII, each pair of upper and lower case characters share the same 5 least
     * significant bits.
     */
    const asciiCaseInsensitiveBits = 0b11111;
    /**
     * Convert a string into an array of 5-bit numbers, representing the
     * characters in a case-insensitive way.
     * @param prefix - the prefix to mask
     */
    const maskCashAddressPrefix = (prefix) => {
        const result = [];
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
        for (let i = 0; i < prefix.length; i++) {
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            result.push(prefix.charCodeAt(i) & asciiCaseInsensitiveBits);
        }
        return result;
    };
    // prettier-ignore
    const bech32GeneratorMostSignificantByte = [0x98, 0x79, 0xf3, 0xae, 0x1e]; // eslint-disable-line @typescript-eslint/no-magic-numbers
    // prettier-ignore
    const bech32GeneratorRemainingBytes = [0xf2bc8e61, 0xb76d99e2, 0x3e5fb3c4, 0x2eabe2a8, 0x4f43e470]; // eslint-disable-line @typescript-eslint/no-magic-numbers
    /**
     * Perform the CashAddress polynomial modulo operation, which is based on the
     * Bech32 polynomial modulo operation, but the returned checksum is 40 bits,
     * rather than 30.
     *
     * A.K.A. `PolyMod`
     *
     * @remarks
     * Notes from Bitcoin ABC:
     * This function will compute what 8 5-bit values to XOR into the last 8 input
     * values, in order to make the checksum 0. These 8 values are packed together
     * in a single 40-bit integer. The higher bits correspond to earlier values.
     *
     * The input is interpreted as a list of coefficients of a polynomial over F
     * = GF(32), with an implicit 1 in front. If the input is [v0,v1,v2,v3,v4],
     * that polynomial is v(x) = 1*x^5 + v0*x^4 + v1*x^3 + v2*x^2 + v3*x + v4.
     * The implicit 1 guarantees that [v0,v1,v2,...] has a distinct checksum
     * from [0,v0,v1,v2,...].
     *
     * The output is a 40-bit integer whose 5-bit groups are the coefficients of
     * the remainder of v(x) mod g(x), where g(x) is the cashaddr generator, x^8
     * + [19]*x^7 + [3]*x^6 + [25]*x^5 + [11]*x^4 + [25]*x^3 + [3]*x^2 + [19]*x
     * + [1]. g(x) is chosen in such a way that the resulting code is a BCH
     * code, guaranteeing detection of up to 4 errors within a window of 1025
     * characters. Among the various possible BCH codes, one was selected to in
     * fact guarantee detection of up to 5 errors within a window of 160
     * characters and 6 errors within a window of 126 characters. In addition,
     * the code guarantee the detection of a burst of up to 8 errors.
     *
     * Note that the coefficients are elements of GF(32), here represented as
     * decimal numbers between []. In this finite field, addition is just XOR of
     * the corresponding numbers. For example, [27] + [13] = [27 ^ 13] = [22].
     * Multiplication is more complicated, and requires treating the bits of
     * values themselves as coefficients of a polynomial over a smaller field,
     * GF(2), and multiplying those polynomials mod a^5 + a^3 + 1. For example,
     * [5] * [26] = (a^2 + 1) * (a^4 + a^3 + a) = (a^4 + a^3 + a) * a^2 + (a^4 +
     * a^3 + a) = a^6 + a^5 + a^4 + a = a^3 + 1 (mod a^5 + a^3 + 1) = [9].
     *
     * During the course of the loop below, `c` contains the bit-packed
     * coefficients of the polynomial constructed from just the values of v that
     * were processed so far, mod g(x). In the above example, `c` initially
     * corresponds to 1 mod (x), and after processing 2 inputs of v, it
     * corresponds to x^2 + v0*x + v1 mod g(x). As 1 mod g(x) = 1, that is the
     * starting value for `c`.
     *
     * @privateRemarks
     * Derived from the `bitcore-lib-cash` implementation, which does not require
     * BigInt: https://github.com/bitpay/bitcore
     *
     * @param v - Array of 5-bit integers over which the checksum is to be computed
     */
    const cashAddressPolynomialModulo = (v) => {
        /* eslint-disable functional/no-let, functional/no-loop-statement, functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers */
        let mostSignificantByte = 0;
        let lowerBytes = 1;
        let c = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of, no-plusplus
        for (let j = 0; j < v.length; j++) {
            c = mostSignificantByte >>> 3;
            mostSignificantByte &= 0x07;
            mostSignificantByte <<= 5;
            mostSignificantByte |= lowerBytes >>> 27;
            lowerBytes &= 0x07ffffff;
            lowerBytes <<= 5;
            lowerBytes ^= v[j];
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < bech32GeneratorMostSignificantByte.length; ++i) {
                // eslint-disable-next-line functional/no-conditional-statement
                if (c & (1 << i)) {
                    mostSignificantByte ^= bech32GeneratorMostSignificantByte[i];
                    lowerBytes ^= bech32GeneratorRemainingBytes[i];
                }
            }
        }
        lowerBytes ^= 1;
        // eslint-disable-next-line functional/no-conditional-statement
        if (lowerBytes < 0) {
            lowerBytes ^= 1 << 31;
            lowerBytes += (1 << 30) * 2;
        }
        return mostSignificantByte * (1 << 30) * 4 + lowerBytes;
        /* eslint-enable functional/no-let, functional/no-loop-statement, functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers */
    };
    const base32WordLength = 5;
    const base256WordLength = 8;
    /**
     * Convert the checksum returned by `cashAddressPolynomialModulo` to an array of
     * 5-bit positive integers which can be Base32 encoded.
     * @param checksum - a 40 bit checksum returned by `cashAddressPolynomialModulo`
     */
    const cashAddressChecksumToUint5Array = (checksum) => {
        const result = [];
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
        for (let i = 0; i < base256WordLength; ++i) {
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers, functional/immutable-data
            result.push(checksum & 31);
            // eslint-disable-next-line functional/no-expression-statement, @typescript-eslint/no-magic-numbers, no-param-reassign
            checksum /= 32;
        }
        // eslint-disable-next-line functional/immutable-data
        return result.reverse();
    };
    const payloadSeparator = 0;
    /**
     * Encode a hash as a CashAddress-like string using the CashAddress format.
     *
     * To encode a standard CashAddress, use `encodeCashAddress`.
     *
     * @param prefix - a valid prefix indicating the network for which to encode the
     * address – must be only lowercase letters
     * @param version - a single byte indicating the version of this address
     * @param hash - the hash to encode
     */
    const encodeCashAddressFormat = (prefix, version, hash) => {
        const checksum40BitPlaceholder = [0, 0, 0, 0, 0, 0, 0, 0];
        const payloadContents = regroupBits({
            bin: Uint8Array.from([version, ...hash]),
            resultWordLength: base32WordLength,
            sourceWordLength: base256WordLength,
        });
        const checksumContents = [
            ...maskCashAddressPrefix(prefix),
            payloadSeparator,
            ...payloadContents,
            ...checksum40BitPlaceholder,
        ];
        const checksum = cashAddressPolynomialModulo(checksumContents);
        const payload = [
            ...payloadContents,
            ...cashAddressChecksumToUint5Array(checksum),
        ];
        return `${prefix}:${encodeBech32(payload)}`;
    };
    var CashAddressEncodingError;
    (function (CashAddressEncodingError) {
        CashAddressEncodingError["unsupportedHashLength"] = "CashAddress encoding error: a hash of this length can not be encoded as a valid CashAddress.";
    })(CashAddressEncodingError || (CashAddressEncodingError = {}));
    const isValidBitLength = (bitLength) => cashAddressSizeToBit[bitLength] !== undefined;
    /**
     * Encode a hash as a CashAddress.
     *
     * Note, this method does not enforce error handling via the type system. The
     * returned string may be a `CashAddressEncodingError.unsupportedHashLength`
     * if `hash` is not a valid length. Check the result if the input is potentially
     * malformed.
     *
     * For other address standards which closely follow the CashAddress
     * specification (but have alternative version byte requirements), use
     * `encodeCashAddressFormat`.
     *
     * @param prefix - a valid prefix indicating the network for which to encode the
     * address (usually a `CashAddressNetworkPrefix`) – must be only lowercase
     * letters
     * @param type - the `CashAddressType` to encode in the version byte – usually a
     * `CashAddressType`
     * @param hash - the hash to encode (for P2PKH, the public key hash; for P2SH,
     * the redeeming bytecode hash)
     */
    const encodeCashAddress = (prefix, type, hash) => {
        const bitLength = hash.length * base256WordLength;
        if (!isValidBitLength(bitLength)) {
            return CashAddressEncodingError.unsupportedHashLength;
        }
        return encodeCashAddressFormat(prefix, encodeCashAddressVersionByte(type, bitLength), hash);
    };
    var CashAddressDecodingError;
    (function (CashAddressDecodingError) {
        CashAddressDecodingError["improperPadding"] = "CashAddress decoding error: the payload is improperly padded.";
        CashAddressDecodingError["invalidCharacters"] = "CashAddress decoding error: the payload contains non-bech32 characters.";
        CashAddressDecodingError["invalidChecksum"] = "CashAddress decoding error: invalid checksum \u2013 please review the address for errors.";
        CashAddressDecodingError["invalidFormat"] = "CashAddress decoding error: CashAddresses should be of the form \"prefix:payload\".";
        CashAddressDecodingError["mismatchedHashLength"] = "CashAddress decoding error: mismatched hash length for specified address version.";
        CashAddressDecodingError["reservedByte"] = "CashAddress decoding error: unknown CashAddress version, reserved byte set.";
    })(CashAddressDecodingError || (CashAddressDecodingError = {}));
    /**
     * Decode and validate a string using the CashAddress format. This is more
     * lenient than `decodeCashAddress`, which also validates the contents of the
     * version byte.
     *
     * Note, this method requires `address` to include a network prefix. To
     * decode a string with an unknown prefix, try
     * `decodeCashAddressFormatWithoutPrefix`.
     *
     * @param address - the CashAddress-like string to decode
     */
    // eslint-disable-next-line complexity
    const decodeCashAddressFormat = (address) => {
        const parts = address.toLowerCase().split(':');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
            return CashAddressDecodingError.invalidFormat;
        }
        const [prefix, payload] = parts;
        if (!isBech32CharacterSet(payload)) {
            return CashAddressDecodingError.invalidCharacters;
        }
        const decodedPayload = decodeBech32(payload);
        const polynomial = [
            ...maskCashAddressPrefix(prefix),
            payloadSeparator,
            ...decodedPayload,
        ];
        if (cashAddressPolynomialModulo(polynomial) !== 0) {
            return CashAddressDecodingError.invalidChecksum;
        }
        const checksum40BitPlaceholderLength = 8;
        const payloadContents = regroupBits({
            allowPadding: false,
            bin: decodedPayload.slice(0, -checksum40BitPlaceholderLength),
            resultWordLength: base256WordLength,
            sourceWordLength: base32WordLength,
        });
        if (typeof payloadContents === 'string') {
            return CashAddressDecodingError.improperPadding;
        }
        const [version, ...hashContents] = payloadContents;
        const hash = Uint8Array.from(hashContents);
        return { hash, prefix, version };
    };
    /**
     * Decode and validate a CashAddress, strictly checking the version byte
     * according to the CashAddress specification. This is important for error
     * detection in CashAddresses.
     *
     * For other address-like standards which closely follow the CashAddress
     * specification (but have alternative version byte requirements), use
     * `decodeCashAddressFormat`.
     *
     * Note, this method requires that CashAddresses include a network prefix. To
     * decode an address with an unknown prefix, try
     * `decodeCashAddressFormatWithoutPrefix`.
     *
     * @param address - the CashAddress to decode
     */
    const decodeCashAddress = (address) => {
        const decoded = decodeCashAddressFormat(address);
        if (typeof decoded === 'string') {
            return decoded;
        }
        const info = decodeCashAddressVersionByte(decoded.version);
        if (info === CashAddressVersionByteDecodingError.reservedBitSet) {
            return CashAddressDecodingError.reservedByte;
        }
        if (decoded.hash.length * base256WordLength !== info.bitLength) {
            return CashAddressDecodingError.mismatchedHashLength;
        }
        return {
            hash: decoded.hash,
            prefix: decoded.prefix,
            type: info.type,
        };
    };
    var CashAddressCorrectionError;
    (function (CashAddressCorrectionError) {
        CashAddressCorrectionError["tooManyErrors"] = "This address has more than 2 errors and cannot be corrected.";
    })(CashAddressCorrectionError || (CashAddressCorrectionError = {}));

    var OpcodesCommon;
    (function (OpcodesCommon) {
        /**
         * A.K.A. `OP_FALSE` or `OP_PUSHBYTES_0`
         */
        OpcodesCommon[OpcodesCommon["OP_0"] = 0] = "OP_0";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_1"] = 1] = "OP_PUSHBYTES_1";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_2"] = 2] = "OP_PUSHBYTES_2";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_3"] = 3] = "OP_PUSHBYTES_3";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_4"] = 4] = "OP_PUSHBYTES_4";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_5"] = 5] = "OP_PUSHBYTES_5";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_6"] = 6] = "OP_PUSHBYTES_6";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_7"] = 7] = "OP_PUSHBYTES_7";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_8"] = 8] = "OP_PUSHBYTES_8";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_9"] = 9] = "OP_PUSHBYTES_9";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_10"] = 10] = "OP_PUSHBYTES_10";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_11"] = 11] = "OP_PUSHBYTES_11";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_12"] = 12] = "OP_PUSHBYTES_12";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_13"] = 13] = "OP_PUSHBYTES_13";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_14"] = 14] = "OP_PUSHBYTES_14";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_15"] = 15] = "OP_PUSHBYTES_15";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_16"] = 16] = "OP_PUSHBYTES_16";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_17"] = 17] = "OP_PUSHBYTES_17";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_18"] = 18] = "OP_PUSHBYTES_18";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_19"] = 19] = "OP_PUSHBYTES_19";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_20"] = 20] = "OP_PUSHBYTES_20";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_21"] = 21] = "OP_PUSHBYTES_21";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_22"] = 22] = "OP_PUSHBYTES_22";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_23"] = 23] = "OP_PUSHBYTES_23";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_24"] = 24] = "OP_PUSHBYTES_24";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_25"] = 25] = "OP_PUSHBYTES_25";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_26"] = 26] = "OP_PUSHBYTES_26";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_27"] = 27] = "OP_PUSHBYTES_27";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_28"] = 28] = "OP_PUSHBYTES_28";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_29"] = 29] = "OP_PUSHBYTES_29";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_30"] = 30] = "OP_PUSHBYTES_30";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_31"] = 31] = "OP_PUSHBYTES_31";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_32"] = 32] = "OP_PUSHBYTES_32";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_33"] = 33] = "OP_PUSHBYTES_33";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_34"] = 34] = "OP_PUSHBYTES_34";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_35"] = 35] = "OP_PUSHBYTES_35";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_36"] = 36] = "OP_PUSHBYTES_36";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_37"] = 37] = "OP_PUSHBYTES_37";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_38"] = 38] = "OP_PUSHBYTES_38";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_39"] = 39] = "OP_PUSHBYTES_39";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_40"] = 40] = "OP_PUSHBYTES_40";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_41"] = 41] = "OP_PUSHBYTES_41";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_42"] = 42] = "OP_PUSHBYTES_42";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_43"] = 43] = "OP_PUSHBYTES_43";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_44"] = 44] = "OP_PUSHBYTES_44";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_45"] = 45] = "OP_PUSHBYTES_45";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_46"] = 46] = "OP_PUSHBYTES_46";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_47"] = 47] = "OP_PUSHBYTES_47";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_48"] = 48] = "OP_PUSHBYTES_48";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_49"] = 49] = "OP_PUSHBYTES_49";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_50"] = 50] = "OP_PUSHBYTES_50";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_51"] = 51] = "OP_PUSHBYTES_51";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_52"] = 52] = "OP_PUSHBYTES_52";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_53"] = 53] = "OP_PUSHBYTES_53";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_54"] = 54] = "OP_PUSHBYTES_54";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_55"] = 55] = "OP_PUSHBYTES_55";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_56"] = 56] = "OP_PUSHBYTES_56";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_57"] = 57] = "OP_PUSHBYTES_57";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_58"] = 58] = "OP_PUSHBYTES_58";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_59"] = 59] = "OP_PUSHBYTES_59";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_60"] = 60] = "OP_PUSHBYTES_60";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_61"] = 61] = "OP_PUSHBYTES_61";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_62"] = 62] = "OP_PUSHBYTES_62";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_63"] = 63] = "OP_PUSHBYTES_63";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_64"] = 64] = "OP_PUSHBYTES_64";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_65"] = 65] = "OP_PUSHBYTES_65";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_66"] = 66] = "OP_PUSHBYTES_66";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_67"] = 67] = "OP_PUSHBYTES_67";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_68"] = 68] = "OP_PUSHBYTES_68";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_69"] = 69] = "OP_PUSHBYTES_69";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_70"] = 70] = "OP_PUSHBYTES_70";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_71"] = 71] = "OP_PUSHBYTES_71";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_72"] = 72] = "OP_PUSHBYTES_72";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_73"] = 73] = "OP_PUSHBYTES_73";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_74"] = 74] = "OP_PUSHBYTES_74";
        OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_75"] = 75] = "OP_PUSHBYTES_75";
        OpcodesCommon[OpcodesCommon["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
        OpcodesCommon[OpcodesCommon["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
        OpcodesCommon[OpcodesCommon["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
        OpcodesCommon[OpcodesCommon["OP_1NEGATE"] = 79] = "OP_1NEGATE";
        OpcodesCommon[OpcodesCommon["OP_RESERVED"] = 80] = "OP_RESERVED";
        /**
         * A.K.A. `OP_TRUE`
         */
        OpcodesCommon[OpcodesCommon["OP_1"] = 81] = "OP_1";
        OpcodesCommon[OpcodesCommon["OP_2"] = 82] = "OP_2";
        OpcodesCommon[OpcodesCommon["OP_3"] = 83] = "OP_3";
        OpcodesCommon[OpcodesCommon["OP_4"] = 84] = "OP_4";
        OpcodesCommon[OpcodesCommon["OP_5"] = 85] = "OP_5";
        OpcodesCommon[OpcodesCommon["OP_6"] = 86] = "OP_6";
        OpcodesCommon[OpcodesCommon["OP_7"] = 87] = "OP_7";
        OpcodesCommon[OpcodesCommon["OP_8"] = 88] = "OP_8";
        OpcodesCommon[OpcodesCommon["OP_9"] = 89] = "OP_9";
        OpcodesCommon[OpcodesCommon["OP_10"] = 90] = "OP_10";
        OpcodesCommon[OpcodesCommon["OP_11"] = 91] = "OP_11";
        OpcodesCommon[OpcodesCommon["OP_12"] = 92] = "OP_12";
        OpcodesCommon[OpcodesCommon["OP_13"] = 93] = "OP_13";
        OpcodesCommon[OpcodesCommon["OP_14"] = 94] = "OP_14";
        OpcodesCommon[OpcodesCommon["OP_15"] = 95] = "OP_15";
        OpcodesCommon[OpcodesCommon["OP_16"] = 96] = "OP_16";
        OpcodesCommon[OpcodesCommon["OP_NOP"] = 97] = "OP_NOP";
        OpcodesCommon[OpcodesCommon["OP_VER"] = 98] = "OP_VER";
        OpcodesCommon[OpcodesCommon["OP_IF"] = 99] = "OP_IF";
        OpcodesCommon[OpcodesCommon["OP_NOTIF"] = 100] = "OP_NOTIF";
        OpcodesCommon[OpcodesCommon["OP_VERIF"] = 101] = "OP_VERIF";
        OpcodesCommon[OpcodesCommon["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
        OpcodesCommon[OpcodesCommon["OP_ELSE"] = 103] = "OP_ELSE";
        OpcodesCommon[OpcodesCommon["OP_ENDIF"] = 104] = "OP_ENDIF";
        OpcodesCommon[OpcodesCommon["OP_VERIFY"] = 105] = "OP_VERIFY";
        OpcodesCommon[OpcodesCommon["OP_RETURN"] = 106] = "OP_RETURN";
        OpcodesCommon[OpcodesCommon["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
        OpcodesCommon[OpcodesCommon["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
        OpcodesCommon[OpcodesCommon["OP_2DROP"] = 109] = "OP_2DROP";
        OpcodesCommon[OpcodesCommon["OP_2DUP"] = 110] = "OP_2DUP";
        OpcodesCommon[OpcodesCommon["OP_3DUP"] = 111] = "OP_3DUP";
        OpcodesCommon[OpcodesCommon["OP_2OVER"] = 112] = "OP_2OVER";
        OpcodesCommon[OpcodesCommon["OP_2ROT"] = 113] = "OP_2ROT";
        OpcodesCommon[OpcodesCommon["OP_2SWAP"] = 114] = "OP_2SWAP";
        OpcodesCommon[OpcodesCommon["OP_IFDUP"] = 115] = "OP_IFDUP";
        OpcodesCommon[OpcodesCommon["OP_DEPTH"] = 116] = "OP_DEPTH";
        OpcodesCommon[OpcodesCommon["OP_DROP"] = 117] = "OP_DROP";
        OpcodesCommon[OpcodesCommon["OP_DUP"] = 118] = "OP_DUP";
        OpcodesCommon[OpcodesCommon["OP_NIP"] = 119] = "OP_NIP";
        OpcodesCommon[OpcodesCommon["OP_OVER"] = 120] = "OP_OVER";
        OpcodesCommon[OpcodesCommon["OP_PICK"] = 121] = "OP_PICK";
        OpcodesCommon[OpcodesCommon["OP_ROLL"] = 122] = "OP_ROLL";
        OpcodesCommon[OpcodesCommon["OP_ROT"] = 123] = "OP_ROT";
        OpcodesCommon[OpcodesCommon["OP_SWAP"] = 124] = "OP_SWAP";
        OpcodesCommon[OpcodesCommon["OP_TUCK"] = 125] = "OP_TUCK";
        OpcodesCommon[OpcodesCommon["OP_CAT"] = 126] = "OP_CAT";
        OpcodesCommon[OpcodesCommon["OP_SUBSTR"] = 127] = "OP_SUBSTR";
        OpcodesCommon[OpcodesCommon["OP_LEFT"] = 128] = "OP_LEFT";
        OpcodesCommon[OpcodesCommon["OP_RIGHT"] = 129] = "OP_RIGHT";
        OpcodesCommon[OpcodesCommon["OP_SIZE"] = 130] = "OP_SIZE";
        OpcodesCommon[OpcodesCommon["OP_INVERT"] = 131] = "OP_INVERT";
        OpcodesCommon[OpcodesCommon["OP_AND"] = 132] = "OP_AND";
        OpcodesCommon[OpcodesCommon["OP_OR"] = 133] = "OP_OR";
        OpcodesCommon[OpcodesCommon["OP_XOR"] = 134] = "OP_XOR";
        OpcodesCommon[OpcodesCommon["OP_EQUAL"] = 135] = "OP_EQUAL";
        OpcodesCommon[OpcodesCommon["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
        OpcodesCommon[OpcodesCommon["OP_RESERVED1"] = 137] = "OP_RESERVED1";
        OpcodesCommon[OpcodesCommon["OP_RESERVED2"] = 138] = "OP_RESERVED2";
        OpcodesCommon[OpcodesCommon["OP_1ADD"] = 139] = "OP_1ADD";
        OpcodesCommon[OpcodesCommon["OP_1SUB"] = 140] = "OP_1SUB";
        OpcodesCommon[OpcodesCommon["OP_2MUL"] = 141] = "OP_2MUL";
        OpcodesCommon[OpcodesCommon["OP_2DIV"] = 142] = "OP_2DIV";
        OpcodesCommon[OpcodesCommon["OP_NEGATE"] = 143] = "OP_NEGATE";
        OpcodesCommon[OpcodesCommon["OP_ABS"] = 144] = "OP_ABS";
        OpcodesCommon[OpcodesCommon["OP_NOT"] = 145] = "OP_NOT";
        OpcodesCommon[OpcodesCommon["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
        OpcodesCommon[OpcodesCommon["OP_ADD"] = 147] = "OP_ADD";
        OpcodesCommon[OpcodesCommon["OP_SUB"] = 148] = "OP_SUB";
        OpcodesCommon[OpcodesCommon["OP_MUL"] = 149] = "OP_MUL";
        OpcodesCommon[OpcodesCommon["OP_DIV"] = 150] = "OP_DIV";
        OpcodesCommon[OpcodesCommon["OP_MOD"] = 151] = "OP_MOD";
        OpcodesCommon[OpcodesCommon["OP_LSHIFT"] = 152] = "OP_LSHIFT";
        OpcodesCommon[OpcodesCommon["OP_RSHIFT"] = 153] = "OP_RSHIFT";
        OpcodesCommon[OpcodesCommon["OP_BOOLAND"] = 154] = "OP_BOOLAND";
        OpcodesCommon[OpcodesCommon["OP_BOOLOR"] = 155] = "OP_BOOLOR";
        OpcodesCommon[OpcodesCommon["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
        OpcodesCommon[OpcodesCommon["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
        OpcodesCommon[OpcodesCommon["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
        OpcodesCommon[OpcodesCommon["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
        OpcodesCommon[OpcodesCommon["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
        OpcodesCommon[OpcodesCommon["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
        OpcodesCommon[OpcodesCommon["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
        OpcodesCommon[OpcodesCommon["OP_MIN"] = 163] = "OP_MIN";
        OpcodesCommon[OpcodesCommon["OP_MAX"] = 164] = "OP_MAX";
        OpcodesCommon[OpcodesCommon["OP_WITHIN"] = 165] = "OP_WITHIN";
        OpcodesCommon[OpcodesCommon["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
        OpcodesCommon[OpcodesCommon["OP_SHA1"] = 167] = "OP_SHA1";
        OpcodesCommon[OpcodesCommon["OP_SHA256"] = 168] = "OP_SHA256";
        OpcodesCommon[OpcodesCommon["OP_HASH160"] = 169] = "OP_HASH160";
        OpcodesCommon[OpcodesCommon["OP_HASH256"] = 170] = "OP_HASH256";
        OpcodesCommon[OpcodesCommon["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
        OpcodesCommon[OpcodesCommon["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
        OpcodesCommon[OpcodesCommon["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
        OpcodesCommon[OpcodesCommon["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
        OpcodesCommon[OpcodesCommon["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
        OpcodesCommon[OpcodesCommon["OP_NOP1"] = 176] = "OP_NOP1";
        /**
         * Previously `OP_NOP2`
         */
        OpcodesCommon[OpcodesCommon["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
        /**
         * Previously `OP_NOP2`
         */
        OpcodesCommon[OpcodesCommon["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
        OpcodesCommon[OpcodesCommon["OP_NOP4"] = 179] = "OP_NOP4";
        OpcodesCommon[OpcodesCommon["OP_NOP5"] = 180] = "OP_NOP5";
        OpcodesCommon[OpcodesCommon["OP_NOP6"] = 181] = "OP_NOP6";
        OpcodesCommon[OpcodesCommon["OP_NOP7"] = 182] = "OP_NOP7";
        OpcodesCommon[OpcodesCommon["OP_NOP8"] = 183] = "OP_NOP8";
        OpcodesCommon[OpcodesCommon["OP_NOP9"] = 184] = "OP_NOP9";
        OpcodesCommon[OpcodesCommon["OP_NOP10"] = 185] = "OP_NOP10";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN186"] = 186] = "OP_UNKNOWN186";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN187"] = 187] = "OP_UNKNOWN187";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN188"] = 188] = "OP_UNKNOWN188";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN189"] = 189] = "OP_UNKNOWN189";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN190"] = 190] = "OP_UNKNOWN190";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN191"] = 191] = "OP_UNKNOWN191";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN192"] = 192] = "OP_UNKNOWN192";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN193"] = 193] = "OP_UNKNOWN193";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN194"] = 194] = "OP_UNKNOWN194";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN195"] = 195] = "OP_UNKNOWN195";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN196"] = 196] = "OP_UNKNOWN196";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN197"] = 197] = "OP_UNKNOWN197";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN198"] = 198] = "OP_UNKNOWN198";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN199"] = 199] = "OP_UNKNOWN199";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN200"] = 200] = "OP_UNKNOWN200";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN201"] = 201] = "OP_UNKNOWN201";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN202"] = 202] = "OP_UNKNOWN202";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN203"] = 203] = "OP_UNKNOWN203";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN204"] = 204] = "OP_UNKNOWN204";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN205"] = 205] = "OP_UNKNOWN205";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN206"] = 206] = "OP_UNKNOWN206";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN207"] = 207] = "OP_UNKNOWN207";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN208"] = 208] = "OP_UNKNOWN208";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN209"] = 209] = "OP_UNKNOWN209";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN210"] = 210] = "OP_UNKNOWN210";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN211"] = 211] = "OP_UNKNOWN211";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN212"] = 212] = "OP_UNKNOWN212";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN213"] = 213] = "OP_UNKNOWN213";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN214"] = 214] = "OP_UNKNOWN214";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN215"] = 215] = "OP_UNKNOWN215";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN216"] = 216] = "OP_UNKNOWN216";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN217"] = 217] = "OP_UNKNOWN217";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN218"] = 218] = "OP_UNKNOWN218";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN219"] = 219] = "OP_UNKNOWN219";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN220"] = 220] = "OP_UNKNOWN220";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN221"] = 221] = "OP_UNKNOWN221";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN222"] = 222] = "OP_UNKNOWN222";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN223"] = 223] = "OP_UNKNOWN223";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN224"] = 224] = "OP_UNKNOWN224";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN225"] = 225] = "OP_UNKNOWN225";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN226"] = 226] = "OP_UNKNOWN226";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN227"] = 227] = "OP_UNKNOWN227";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN228"] = 228] = "OP_UNKNOWN228";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN229"] = 229] = "OP_UNKNOWN229";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN230"] = 230] = "OP_UNKNOWN230";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN231"] = 231] = "OP_UNKNOWN231";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN232"] = 232] = "OP_UNKNOWN232";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN233"] = 233] = "OP_UNKNOWN233";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN234"] = 234] = "OP_UNKNOWN234";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN235"] = 235] = "OP_UNKNOWN235";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN236"] = 236] = "OP_UNKNOWN236";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN237"] = 237] = "OP_UNKNOWN237";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN238"] = 238] = "OP_UNKNOWN238";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN239"] = 239] = "OP_UNKNOWN239";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN240"] = 240] = "OP_UNKNOWN240";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN241"] = 241] = "OP_UNKNOWN241";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN242"] = 242] = "OP_UNKNOWN242";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN243"] = 243] = "OP_UNKNOWN243";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN244"] = 244] = "OP_UNKNOWN244";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN245"] = 245] = "OP_UNKNOWN245";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN246"] = 246] = "OP_UNKNOWN246";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN247"] = 247] = "OP_UNKNOWN247";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN248"] = 248] = "OP_UNKNOWN248";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN249"] = 249] = "OP_UNKNOWN249";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN250"] = 250] = "OP_UNKNOWN250";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN251"] = 251] = "OP_UNKNOWN251";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN252"] = 252] = "OP_UNKNOWN252";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN253"] = 253] = "OP_UNKNOWN253";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN254"] = 254] = "OP_UNKNOWN254";
        OpcodesCommon[OpcodesCommon["OP_UNKNOWN255"] = 255] = "OP_UNKNOWN255";
    })(OpcodesCommon || (OpcodesCommon = {}));

    /**
     * The most common address types used on bitcoin and bitcoin-like networks. Each
     * address type represents a commonly used locking bytecode pattern.
     *
     * @remarks
     * Addresses are strings which encode information about the network and
     * `lockingBytecode` to which a transaction output can pay.
     *
     * Several address formats exist – `Base58Address` was the format used by the
     * original satoshi client, and is still in use on several active chains (see
     * `encodeBase58Address`). On Bitcoin Cash, the `CashAddress` standard is most
     * common (See `encodeCashAddress`).
     */
    var AddressType;
    (function (AddressType) {
        /**
         * Pay to Public Key (P2PK). This address type is uncommon, and primarily
         * occurs in early blocks because the original satoshi implementation mined
         * rewards to P2PK addresses.
         *
         * There are no standardized address formats for representing a P2PK address.
         * Instead, most applications use the `AddressType.p2pkh` format.
         */
        AddressType["p2pk"] = "P2PK";
        /**
         * Pay to Public Key Hash (P2PKH). The most common address type. P2PKH
         * addresses lock funds using a single private key.
         */
        AddressType["p2pkh"] = "P2PKH";
        /**
         * Pay to Script Hash (P2SH). An address type which locks funds to the hash of
         * a script provided in the spending transaction. See BIP13 for details.
         */
        AddressType["p2sh"] = "P2SH";
        /**
         * This `AddressType` represents an address using an unknown or uncommon
         * locking bytecode pattern for which no standardized address formats exist.
         */
        AddressType["unknown"] = "unknown";
    })(AddressType || (AddressType = {}));
    /**
     * Attempt to match a lockingBytecode to a standard address type for use in
     * address encoding. (See `AddressType` for details.)
     *
     * For a locking bytecode matching the Pay to Public Key Hash (P2PKH) pattern,
     * the returned `type` is `AddressType.p2pkh` and `payload` is the `HASH160` of
     * the public key.
     *
     * For a locking bytecode matching the Pay to Script Hash (P2SH) pattern, the
     * returned `type` is `AddressType.p2sh` and `payload` is the `HASH160` of the
     * redeeming bytecode, A.K.A. "redeem script hash".
     *
     * For a locking bytecode matching the Pay to Public Key (P2PK) pattern, the
     * returned `type` is `AddressType.p2pk` and `payload` is the full public key.
     *
     * Any other locking bytecode will return a `type` of `AddressType.unknown` and
     * a payload of the unmodified `bytecode`.
     *
     * @param bytecode - the locking bytecode to match
     */
    // eslint-disable-next-line complexity
    const lockingBytecodeToAddressContents = (bytecode) => {
        const p2pkhLength = 25;
        if (bytecode.length === p2pkhLength &&
            bytecode[0] === OpcodesCommon.OP_DUP &&
            bytecode[1] === OpcodesCommon.OP_HASH160 &&
            bytecode[2] === OpcodesCommon.OP_PUSHBYTES_20 &&
            bytecode[23] === OpcodesCommon.OP_EQUALVERIFY &&
            bytecode[24] === OpcodesCommon.OP_CHECKSIG) {
            const start = 3;
            const end = 23;
            return { payload: bytecode.slice(start, end), type: AddressType.p2pkh };
        }
        const p2shLength = 23;
        if (bytecode.length === p2shLength &&
            bytecode[0] === OpcodesCommon.OP_HASH160 &&
            bytecode[1] === OpcodesCommon.OP_PUSHBYTES_20 &&
            bytecode[22] === OpcodesCommon.OP_EQUAL) {
            const start = 2;
            const end = 22;
            return { payload: bytecode.slice(start, end), type: AddressType.p2sh };
        }
        const p2pkUncompressedLength = 67;
        if (bytecode.length === p2pkUncompressedLength &&
            bytecode[0] === OpcodesCommon.OP_PUSHBYTES_65 &&
            bytecode[66] === OpcodesCommon.OP_CHECKSIG) {
            const start = 1;
            const end = 66;
            return { payload: bytecode.slice(start, end), type: AddressType.p2pk };
        }
        const p2pkCompressedLength = 35;
        if (bytecode.length === p2pkCompressedLength &&
            bytecode[0] === OpcodesCommon.OP_PUSHBYTES_33 &&
            bytecode[34] === OpcodesCommon.OP_CHECKSIG) {
            const start = 1;
            const end = 34;
            return { payload: bytecode.slice(start, end), type: AddressType.p2pk };
        }
        return {
            payload: bytecode.slice(),
            type: AddressType.unknown,
        };
    };
    /**
     * Get the locking bytecode for a valid `AddressContents` object. See
     * `lockingBytecodeToAddressContents` for details.
     *
     * For `AddressContents` of `type` `AddressType.unknown`, this method returns
     * the `payload` without modification.
     *
     * @param addressContents - the `AddressContents` to encode
     */
    const addressContentsToLockingBytecode = (addressContents) => {
        if (addressContents.type === AddressType.p2pkh) {
            return Uint8Array.from([
                OpcodesCommon.OP_DUP,
                OpcodesCommon.OP_HASH160,
                OpcodesCommon.OP_PUSHBYTES_20,
                ...addressContents.payload,
                OpcodesCommon.OP_EQUALVERIFY,
                OpcodesCommon.OP_CHECKSIG,
            ]);
        }
        if (addressContents.type === AddressType.p2sh) {
            return Uint8Array.from([
                OpcodesCommon.OP_HASH160,
                OpcodesCommon.OP_PUSHBYTES_20,
                ...addressContents.payload,
                OpcodesCommon.OP_EQUAL,
            ]);
        }
        if (addressContents.type === AddressType.p2pk) {
            const compressedPublicKeyLength = 33;
            return addressContents.payload.length === compressedPublicKeyLength
                ? Uint8Array.from([
                    OpcodesCommon.OP_PUSHBYTES_33,
                    ...addressContents.payload,
                    OpcodesCommon.OP_CHECKSIG,
                ])
                : Uint8Array.from([
                    OpcodesCommon.OP_PUSHBYTES_65,
                    ...addressContents.payload,
                    OpcodesCommon.OP_CHECKSIG,
                ]);
        }
        return addressContents.payload;
    };
    /**
     * Encode a locking bytecode as a CashAddress given a network prefix.
     *
     * If `bytecode` matches either the P2PKH or P2SH pattern, it is encoded using
     * the proper address type and returned as a valid CashAddress (string).
     *
     * If `bytecode` cannot be encoded as an address (i.e. because the pattern is
     * not standard), the resulting `AddressContents` is returned.
     *
     * @param bytecode - the locking bytecode to encode
     * @param prefix - the network prefix to use, e.g. `bitcoincash`, `bchtest`, or
     * `bchreg`
     */
    const lockingBytecodeToCashAddress = (bytecode, prefix) => {
        const contents = lockingBytecodeToAddressContents(bytecode);
        if (contents.type === AddressType.p2pkh) {
            return encodeCashAddress(prefix, CashAddressType.P2PKH, contents.payload);
        }
        if (contents.type === AddressType.p2sh) {
            return encodeCashAddress(prefix, CashAddressType.P2SH, contents.payload);
        }
        return contents;
    };
    var LockingBytecodeEncodingError;
    (function (LockingBytecodeEncodingError) {
        LockingBytecodeEncodingError["unknownCashAddressType"] = "This CashAddress uses an unknown address type.";
    })(LockingBytecodeEncodingError || (LockingBytecodeEncodingError = {}));
    /**
     * Convert a CashAddress to its respective locking bytecode.
     *
     * This method returns the locking bytecode and network prefix. If an error
     * occurs, an error message is returned as a string.
     *
     * @param address - the CashAddress to convert
     */
    const cashAddressToLockingBytecode = (address) => {
        const decoded = decodeCashAddress(address);
        if (typeof decoded === 'string')
            return decoded;
        if (decoded.type === CashAddressType.P2PKH) {
            return {
                bytecode: addressContentsToLockingBytecode({
                    payload: decoded.hash,
                    type: AddressType.p2pkh,
                }),
                prefix: decoded.prefix,
            };
        }
        if (decoded.type === CashAddressType.P2SH) {
            return {
                bytecode: addressContentsToLockingBytecode({
                    payload: decoded.hash,
                    type: AddressType.p2sh,
                }),
                prefix: decoded.prefix,
            };
        }
        return LockingBytecodeEncodingError.unknownCashAddressType;
    };

    /* eslint-disable functional/no-conditional-statement, functional/no-let, functional/no-expression-statement, no-underscore-dangle, functional/no-try-statement, @typescript-eslint/no-magic-numbers, max-params, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    /**
     * Note, most of this method is translated and boiled-down from the wasm-pack
     * workflow. Significant changes to wasm-bindgen or wasm-pack build will likely
     * require modifications to this method.
     */
    const instantiateRustWasm = async (webassemblyBytes, expectedImportModuleName, hashExportName, initExportName, updateExportName, finalExportName) => {
        const wasm = (await WebAssembly.instantiate(webassemblyBytes, {
            [expectedImportModuleName]: {
                /**
                 * This would only be called in cases where a `__wbindgen_malloc` failed.
                 * Since `__wbindgen_malloc` isn't exposed to consumers, this error
                 * can only be encountered if the code below is broken.
                 */
                // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
                __wbindgen_throw: /* istanbul ignore next */ (ptr, len) => {
                    // eslint-disable-next-line functional/no-throw-statement
                    throw new Error(
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    Array.from(getUint8Memory().subarray(ptr, ptr + len))
                        .map((num) => String.fromCharCode(num))
                        .join(''));
                },
            },
        })).instance.exports; // eslint-disable-line @typescript-eslint/no-explicit-any
        let cachedUint8Memory; // eslint-disable-line @typescript-eslint/init-declarations
        let cachedUint32Memory; // eslint-disable-line @typescript-eslint/init-declarations
        let cachedGlobalArgumentPtr; // eslint-disable-line @typescript-eslint/init-declarations
        const globalArgumentPtr = () => {
            if (cachedGlobalArgumentPtr === undefined) {
                cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
            }
            return cachedGlobalArgumentPtr;
        };
        /**
         * Must be hoisted for `__wbindgen_throw`.
         */
        // eslint-disable-next-line func-style
        function getUint8Memory() {
            if (cachedUint8Memory === undefined ||
                cachedUint8Memory.buffer !== wasm.memory.buffer) {
                cachedUint8Memory = new Uint8Array(wasm.memory.buffer);
            }
            return cachedUint8Memory;
        }
        const getUint32Memory = () => {
            if (cachedUint32Memory === undefined ||
                cachedUint32Memory.buffer !== wasm.memory.buffer) {
                cachedUint32Memory = new Uint32Array(wasm.memory.buffer);
            }
            return cachedUint32Memory;
        };
        const passArray8ToWasm = (array) => {
            const ptr = wasm.__wbindgen_malloc(array.length);
            getUint8Memory().set(array, ptr);
            return [ptr, array.length];
        };
        const getArrayU8FromWasm = (ptr, len) => getUint8Memory().subarray(ptr, ptr + len);
        const hash = (input) => {
            const [ptr0, len0] = passArray8ToWasm(input);
            const retPtr = globalArgumentPtr();
            try {
                wasm[hashExportName](retPtr, ptr0, len0);
                const mem = getUint32Memory();
                const ptr = mem[retPtr / 4];
                const len = mem[retPtr / 4 + 1];
                const realRet = getArrayU8FromWasm(ptr, len).slice();
                wasm.__wbindgen_free(ptr, len);
                return realRet;
            }
            finally {
                wasm.__wbindgen_free(ptr0, len0);
            }
        };
        const init = () => {
            const retPtr = globalArgumentPtr();
            wasm[initExportName](retPtr);
            const mem = getUint32Memory();
            const ptr = mem[retPtr / 4];
            const len = mem[retPtr / 4 + 1];
            const realRet = getArrayU8FromWasm(ptr, len).slice();
            wasm.__wbindgen_free(ptr, len);
            return realRet;
        };
        const update = (rawState, input) => {
            const [ptr0, len0] = passArray8ToWasm(rawState);
            const [ptr1, len1] = passArray8ToWasm(input);
            const retPtr = globalArgumentPtr();
            try {
                wasm[updateExportName](retPtr, ptr0, len0, ptr1, len1);
                const mem = getUint32Memory();
                const ptr = mem[retPtr / 4];
                const len = mem[retPtr / 4 + 1];
                const realRet = getArrayU8FromWasm(ptr, len).slice();
                wasm.__wbindgen_free(ptr, len);
                return realRet;
            }
            finally {
                rawState.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));
                wasm.__wbindgen_free(ptr0, len0);
                wasm.__wbindgen_free(ptr1, len1);
            }
        };
        const final = (rawState) => {
            const [ptr0, len0] = passArray8ToWasm(rawState);
            const retPtr = globalArgumentPtr();
            try {
                wasm[finalExportName](retPtr, ptr0, len0);
                const mem = getUint32Memory();
                const ptr = mem[retPtr / 4];
                const len = mem[retPtr / 4 + 1];
                const realRet = getArrayU8FromWasm(ptr, len).slice();
                wasm.__wbindgen_free(ptr, len);
                return realRet;
            }
            finally {
                rawState.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));
                wasm.__wbindgen_free(ptr0, len0);
            }
        };
        return {
            final,
            hash,
            init,
            update,
        };
    };
    /* eslint-enable functional/no-conditional-statement, functional/no-let, functional/no-expression-statement, no-underscore-dangle, functional/no-try-statement, @typescript-eslint/no-magic-numbers, max-params, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    /* eslint-disable tsdoc/syntax */
    /**
     * @hidden
     */
    // prettier-ignore
    const ripemd160Base64Bytes = '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AgQMBQsgAEH8EigCACACaiICQQFyNgIEQYQTIAA2AgBB/BIgAjYCACAAIAJqIAI2AgAMBAsgAxAgDAELQewPQewPKAIAQX4gAUEDdndxNgIACyAEIAJqIQIgAyAEaiEDCyADIAMoAgRBfnE2AgQgACACQQFyNgIEIAAgAmogAjYCAAJ/AkAgAkH/AU0EQCACQQN2IgFBA3RB9A9qIQJB7A8oAgAiA0EBIAFBH3F0IgFxRQ0BIAJBCGohAyACKAIIDAILIAAgAhAhDAILQewPIAMgAXI2AgAgAkEIaiEDIAILIQEgAyAANgIAIAEgADYCDCAAIAI2AgwgACABNgIICyAFQQhqDwtBgBMgACACayIBNgIAQYgTQYgTKAIAIgAgAmoiAzYCACADIAFBAXI2AgQgACACQQNyNgIEIABBCGoLpQEBAn9BAiEFAkACQAJAAkACQCAAKAIEIgYgAWsgAk8NACABIAJqIgIgAUkhAQJAIAQEQEEAIQUgAQ0CIAZBAXQiASACIAIgAUkbIQIMAQtBACEFIAENAQsgAkEASA0AIAZFDQEgACgCACACEBMiAUUNAgwDCyAFDwsgAhAEIgENAQsgAw0BCyABBEAgACABNgIAIABBBGogAjYCAEECDwtBAQ8LAAsIAEGMFBAHAAtmAgF/A34jAEEwayIBJAAgACkCECECIAApAgghAyAAKQIAIQQgAUEUakEANgIAIAEgBDcDGCABQgE3AgQgAUH0DDYCECABIAFBGGo2AgAgASADNwMgIAEgAjcDKCABIAFBIGoQJQALuAEBAX8jAEHgAWsiAyQAIANBOGpBzAgoAgA2AgAgA0EwakHECCkCADcDACADQgA3AyAgA0G8CCkCADcDKCADQTxqQQBBxAAQKhogA0EgaiABIAIQCSADQYABaiADQSBqQeAAECgaIANBCGogA0GAAWoQCiADQSBqIANBCGpBFBADIANBiAFqIANBKGooAgA2AgAgAyADKQMgNwOAASADIANBgAFqEAsgACADKQMANwIAIANB4AFqJAALlwMBBH8jAEFAaiIDJAAgACAAKQMAIAKtfDcDACADIABBCGo2AiggAyADQShqNgIsAkACQAJAAkACQAJAIAAoAhwiBQRAQcAAIAVrIgQgAk0NASADQRhqIAUgBSACaiIEIABBIGoQFiADKAIcIAJHDQUgAygCGCABIAIQKBoMAwsgAiEEDAELIANBMGogASACIAQQFyADQTxqKAIAIQQgAygCOCEBIAMoAjAhBSADKAI0IQIgA0EgaiAAQSBqIgYgACgCHBAYIAIgAygCJEcNBCADKAIgIAUgAhAoGiAAQRxqQQA2AgAgA0EsaiAGEBkLIANBPGohAiADQThqIQUCQANAIARBP00NASADQTBqIAEgBEHAABAXIAIoAgAhBCAFKAIAIQEgA0EIakEAQcAAIAMoAjAgAygCNBAaIANBLGogAygCCBAZDAALAAsgA0EQaiAAQSBqIAQQGyADKAIUIARHDQEgAygCECABIAQQKBoLIABBHGogBDYCACADQUBrJAAPC0H0ExAHAAtB9BMQBwALQfQTEAcAC+MCAgR/AX4jAEFAaiICJAAgAiABQQhqIgU2AiQgASkDACEGIAEoAhwhAyACIAJBJGo2AigCQCADQT9NBEAgAUEgaiIEIANqQYABOgAAIAEgASgCHEEBaiIDNgIcIAJBGGogBCADEBggAigCGEEAIAIoAhwQKhpBwAAgASgCHGtBB00EQCACQShqIAQQGSACQRBqIAQgAUEcaigCABAbIAIoAhBBACACKAIUECoaCyACQQhqIARBOBAYIAIoAgxBCEcNASACKAIIIAZCA4Y3AAAgAkEoaiAEEBkgAUEcakEANgIAIAJBADYCKEEEIQECQANAIAFBGEYNASACQShqIAFqQQA6AAAgAiACKAIoQQFqNgIoIAFBAWohAQwACwALIAAgBSkAADcAACAAQRBqIAVBEGooAAA2AAAgAEEIaiAFQQhqKQAANwAAIAJBQGskAA8LQcwTIANBwAAQHQALQdwTEAcAC2MBAn8gASgCACECAkACQCABKAIEIgMgASgCCCIBRgRAIAMhAQwBCyADIAFJDQEgAQRAIAIgARATIgINAQALIAIgAxARQQEhAkEAIQELIAAgATYCBCAAIAI2AgAPC0G0ExAHAAuQAQEBfyMAQYABayIBJAAgAUEwakHECCkCADcDACABQThqQcwIKAIANgIAIAFCADcDICABQbwIKQIANwMoIAFBPGpBAEHEABAqGiABQRBqIAFBIGpB4AAQAyABQShqIAFBGGooAgA2AgAgASABKQMQNwMgIAFBCGogAUEgahALIAAgASkDCDcCACABQYABaiQAC4YB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';

    // cSpell:ignore noncefp, ndata, outputlen
    /**
     * bitflags used in secp256k1's public API (translated from secp256k1.h)
     */
    /* eslint-disable no-bitwise, @typescript-eslint/no-magic-numbers */
    /** All flags' lower 8 bits indicate what they're for. Do not use directly. */
    // const SECP256K1_FLAGS_TYPE_MASK = (1 << 8) - 1;
    const SECP256K1_FLAGS_TYPE_CONTEXT = 1 << 0;
    const SECP256K1_FLAGS_TYPE_COMPRESSION = 1 << 1;
    /** The higher bits contain the actual data. Do not use directly. */
    const SECP256K1_FLAGS_BIT_CONTEXT_VERIFY = 1 << 8;
    const SECP256K1_FLAGS_BIT_CONTEXT_SIGN = 1 << 9;
    const SECP256K1_FLAGS_BIT_COMPRESSION = 1 << 8;
    /** Flags to pass to secp256k1_context_create. */
    const SECP256K1_CONTEXT_VERIFY = SECP256K1_FLAGS_TYPE_CONTEXT | SECP256K1_FLAGS_BIT_CONTEXT_VERIFY;
    const SECP256K1_CONTEXT_SIGN = SECP256K1_FLAGS_TYPE_CONTEXT | SECP256K1_FLAGS_BIT_CONTEXT_SIGN;
    const SECP256K1_CONTEXT_NONE = SECP256K1_FLAGS_TYPE_CONTEXT;
    /** Flag to pass to secp256k1_ec_pubkey_serialize and secp256k1_ec_privkey_export. */
    const SECP256K1_EC_COMPRESSED = SECP256K1_FLAGS_TYPE_COMPRESSION | SECP256K1_FLAGS_BIT_COMPRESSION;
    const SECP256K1_EC_UNCOMPRESSED = SECP256K1_FLAGS_TYPE_COMPRESSION;
    /**
     * Flag to pass to a Secp256k1.contextCreate method.
     *
     * The purpose of context structures is to cache large precomputed data tables
     * that are expensive to construct, and also to maintain the randomization data
     * for blinding.
     *
     * You can create a context with only VERIFY or only SIGN capabilities, or you
     * can use BOTH. (NONE can be used for conversion/serialization.)
     */
    var ContextFlag;
    (function (ContextFlag) {
        ContextFlag[ContextFlag["NONE"] = SECP256K1_CONTEXT_NONE] = "NONE";
        ContextFlag[ContextFlag["VERIFY"] = SECP256K1_CONTEXT_VERIFY] = "VERIFY";
        ContextFlag[ContextFlag["SIGN"] = SECP256K1_CONTEXT_SIGN] = "SIGN";
        ContextFlag[ContextFlag["BOTH"] = SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY] = "BOTH";
    })(ContextFlag || (ContextFlag = {}));
    /**
     * Flag to pass a Secp256k1 public key serialization method.
     *
     * You can indicate COMPRESSED (33 bytes, header byte 0x02 or 0x03) or
     * UNCOMPRESSED (65 bytes, header byte 0x04) format.
     */
    var CompressionFlag;
    (function (CompressionFlag) {
        CompressionFlag[CompressionFlag["COMPRESSED"] = SECP256K1_EC_COMPRESSED] = "COMPRESSED";
        CompressionFlag[CompressionFlag["UNCOMPRESSED"] = SECP256K1_EC_UNCOMPRESSED] = "UNCOMPRESSED";
    })(CompressionFlag || (CompressionFlag = {}));

    /* eslint-disable tsdoc/syntax */
    /**
     * @hidden
     */
    // prettier-ignore
    const secp256k1Base64Bytes = 'AGFzbQEAAAABXg5gAn9/AGAGf39/f39/AX9gAX8AYAABf2AAAGADf39/AX9gAX8Bf2ACf38Bf2AEf39/fwF/YAV/f39/fwF/YAN/f38AYAd/f39/f39/AX9gBH9/f38AYAV/f39/fwAC5wEMA2VudgZtZW1vcnkCAYACgAIDZW52BXRhYmxlAXABBgYDZW52CXRhYmxlQmFzZQN/AANlbnYORFlOQU1JQ1RPUF9QVFIDfwADZW52CFNUQUNLVE9QA38AA2VudgVhYm9ydAACA2Vudg1lbmxhcmdlTWVtb3J5AAMDZW52DmdldFRvdGFsTWVtb3J5AAMDZW52F2Fib3J0T25DYW5ub3RHcm93TWVtb3J5AAMDZW52C19fX3NldEVyck5vAAIDZW52Bl9hYm9ydAAEA2VudhZfZW1zY3JpcHRlbl9tZW1jcHlfYmlnAAUDSUgAAAYKBQAKCgIMAAYABwACBgUNCgAKAAoAAAcHAAAAAgYMCgoFAAUFAAULAQYFAwcBCAgBCAgKBwUFBQUHAQEIBQUFCAUICQgGCwJ/ASMBC38BIwILB/QGGxFfX19lcnJub19sb2NhdGlvbgA1BV9mcmVlACYHX21hbGxvYwAnGV9zZWNwMjU2azFfY29udGV4dF9jcmVhdGUAMxxfc2VjcDI1NmsxX2NvbnRleHRfcmFuZG9taXplAD4fX3NlY3AyNTZrMV9lY19wcml2a2V5X3R3ZWFrX2FkZABCH19zZWNwMjU2azFfZWNfcHJpdmtleV90d2Vha19tdWwAQBtfc2VjcDI1NmsxX2VjX3B1YmtleV9jcmVhdGUAMBpfc2VjcDI1NmsxX2VjX3B1YmtleV9wYXJzZQBOHl9zZWNwMjU2azFfZWNfcHVia2V5X3NlcmlhbGl6ZQBNHl9zZWNwMjU2azFfZWNfcHVia2V5X3R3ZWFrX2FkZABBHl9zZWNwMjU2azFfZWNfcHVia2V5X3R3ZWFrX211bAA/G19zZWNwMjU2azFfZWNfc2Vja2V5X3ZlcmlmeQBDGF9zZWNwMjU2azFfZWNkc2FfcmVjb3ZlcgA5NF9zZWNwMjU2azFfZWNkc2FfcmVjb3ZlcmFibGVfc2lnbmF0dXJlX3BhcnNlX2NvbXBhY3QAPDhfc2VjcDI1NmsxX2VjZHNhX3JlY292ZXJhYmxlX3NpZ25hdHVyZV9zZXJpYWxpemVfY29tcGFjdAA7FV9zZWNwMjU2azFfZWNkc2Ffc2lnbgBEIV9zZWNwMjU2azFfZWNkc2Ffc2lnbl9yZWNvdmVyYWJsZQA6I19zZWNwMjU2azFfZWNkc2Ffc2lnbmF0dXJlX21hbGxlYXRlAEgkX3NlY3AyNTZrMV9lY2RzYV9zaWduYXR1cmVfbm9ybWFsaXplAEcoX3NlY3AyNTZrMV9lY2RzYV9zaWduYXR1cmVfcGFyc2VfY29tcGFjdABLJF9zZWNwMjU2azFfZWNkc2Ffc2lnbmF0dXJlX3BhcnNlX2RlcgBMLF9zZWNwMjU2azFfZWNkc2Ffc2lnbmF0dXJlX3NlcmlhbGl6ZV9jb21wYWN0AEkoX3NlY3AyNTZrMV9lY2RzYV9zaWduYXR1cmVfc2VyaWFsaXplX2RlcgBKF19zZWNwMjU2azFfZWNkc2FfdmVyaWZ5AEYXX3NlY3AyNTZrMV9zY2hub3JyX3NpZ24ANxlfc2VjcDI1NmsxX3NjaG5vcnJfdmVyaWZ5ADgJDAEAIwALBjJFJSQkJQqU7wZIzQcCCH8VfiABKAIEIgJBAXStIhMgASgCICIDrSILfiABKAIAIgRBAXStIg8gASgCJK0iCn58IAEoAggiBUEBdK0iFiABKAIcIgatIhF+fCABKAIMIgdBAXStIhggASgCGCIIrSIUfnwgASgCECIJQQF0rSIQIAEoAhQiAa0iF358IRogFiALfiATIAp+fCAYIBF+fCAQIBR+fCAXIBd+fCAaQhqIfCIMQv///x+DIg1CkPoAfiAErSIOIA5+fCEbIA1CCoYgAq0iDSAPfnwgG0IaiHwgGCALfiAWIAp+fCAQIBF+fCABQQF0rSIOIBR+fCAMQhqIfCIZQv///x+DIhJCkPoAfnwhHCAFrSIMIA9+IA0gDX58IBJCCoZ8IBQgFH4gGCAKfnwgECALfnwgDiARfnwgGUIaiHwiFUL///8fgyISQpD6AH58IBxCGoh8IRkgACAHrSINIA9+IAwgE358IBJCCoZ8IBAgCn4gCEEBdK0iEiARfnwgDiALfnwgFUIaiHwiFUL///8fgyIdQpD6AH58IBlCGoh8Ih6nQf///x9xNgIMIAAgDSATfiAMIAx+fCAJrSIQIA9+fCAdQgqGfCASIAt+IBEgEX58IA4gCn58IBVCGoh8Ig5C////H4MiDEKQ+gB+fCAeQhqIfCIVp0H///8fcTYCECAAIBAgE34gDSAWfnwgFyAPfnwgDEIKhnwgEiAKfiAGQQF0rSIMIAt+fCAOQhqIfCIOQv///x+DIhJCkPoAfnwgFUIaiHwiFadB////H3E2AhQgACAUIA9+IA0gDX58IBAgFn58IBcgE358IBJCCoZ8IAwgCn4gCyALfnwgDkIaiHwiDUL///8fgyIOQpD6AH58IBVCGoh8IgynQf///x9xNgIYIAAgFCATfiARIA9+fCAQIBh+fCAXIBZ+fCAOQgqGfCANQhqIIANBAXStIAp+fCINQv///x+DIg5CkPoAfnwgDEIaiHwiDKdB////H3E2AhwgACARIBN+IAsgD358IBQgFn58IBAgEH58IBcgGH58IA5CCoZ8IA1CGoggCiAKfnwiCkL///8fgyILQpD6AH58IAxCGoh8Ig+nQf///x9xNgIgIAAgCkIaiCIKQpD6AH4gGkL///8fg3wgC0IKhnwgD0IaiHwiC6dB////AXE2AiQgACALQhaIIApCDoZ8IgpC0Qd+IBtC////H4N8IgunQf///x9xNgIAIAAgCkIGhiAcQv///x+DfCALQhqIfCIKp0H///8fcTYCBCAAIApCGoggGUL///8fg3w+AggL4xQCIX8MfiMEIQ8jBEFAayQEIA8gASgCAK0iJSAlfiImPgIAIAFBBGoiFygCAK0iJCAlfiIjQiCIISkgI6ciA0EBdCIEICZCIIinaiICIARJIQUgDyACNgIEIAFBCGoiHCgCAK0iJyAlfiIjQiCIISggBCADSSApQgGGpyIGciAFaiIEICOnIgNBAXQiCGoiAiAISSEJIAUgBEVxIAYgKadJaiAIIANJIChCAYanIgVyIAlqIg5qIgggAiAkICR+IiOnIgNqIgIgA0kgI0IgiKdqIgZqIQogDyACNgIIIAFBDGoiHSgCAK0iJiAlfiIjQiCIISUgCiAjpyIEQQF0IgtqIgIgC0khDCAnICR+IiNCIIghJCACICOnIgNBAXQiB2oiAiAHSSENIA8gAjYCDCABQRBqIh4oAgCtIikgASgCAK0iJ34iI0IgiCErIAkgDkVxIAUgKKdJaiAIIA5JaiAKIAZJaiALIARJICVCAYanIgtyIAxqIglqIgUgByADSSAkQgGGpyIIciANaiIKaiIGICOnIgRBAXQiB2oiAiAHSSEVICYgFygCAK0iJn4iI0IgiCEoIAIgI6ciA0EBdCIOaiICIA5JIRAgCCAkp0kgCyAlp0lqIAwgCUVxaiAFIAlJaiANIApFcWogBiAKSWogByAESSArQgGGpyIKciAVaiIRaiIHIA4gA0kgKEIBhqciC3IgEGoiEmoiBSACIBwoAgCtIiUgJX4iI6ciA2oiAiADSSAjQiCIp2oiCGohDCAPIAI2AhAgAUEUaiIYKAIArSAnfiIjQiCIISQgDCAjpyIGQQF0Ig5qIgIgDkkhFiApICZ+IiNCIIghJyACICOnIgRBAXQiDWoiAiANSSETIB0oAgCtICV+IiNCIIghJiACICOnIgNBAXQiCWoiAiAJSSEUIA8gAjYCFCABQRhqIh8oAgCtIAEoAgCtfiIjQiCIISwgCyAop0kgCiArp0lqIBUgEUVxaiAQIBJFcWogByARSWogBSASSWogDCAISWogDiAGSSAkQgGGpyIOciAWaiIQaiIKIA0gBEkgJ0IBhqciB3IgE2oiEWoiCyAJIANJICZCAYanIgVyIBRqIhJqIgggI6ciBkEBdCIJaiICIAlJISEgGCgCAK0gFygCAK1+IiNCIIghLSACICOnIgRBAXQiDGoiAiAMSSEZIB4oAgCtIBwoAgCtfiIjQiCIISggAiAjpyIDQQF0Ig1qIgIgDUkhGiAHICenSSAOICSnSWogBSAmp0lqIBYgEEVxaiAKIBBJaiATIBFFcWogCyARSWogFCASRXFqIAggEklqIAkgBkkgLEIBhqciCXIgIWoiG2oiDiAMIARJIC1CAYanIgpyIBlqIhNqIgcgDSADSSAoQgGGpyILciAaaiIUaiIFIAIgHSgCAK0iIyAjfiIjpyIDaiICIANJICNCIIinaiIIaiEQIA8gAjYCGCABQRxqIiAoAgCtIAEoAgCtfiIjQiCIISogECAjpyIGQQF0IhFqIgEgEUkhIiAfKAIArSAXKAIArSIpfiIjQiCIISsgASAjpyIEQQF0IhJqIgEgEkkhFyAYKAIArSAcKAIArSInfiIjQiCIISUgASAjpyIDQQF0IgxqIgEgDEkhFSAeKAIArSAdKAIArSImfiIjQiCIISQgASAjpyICQQF0Ig1qIgEgDUkhFiAPIAE2AhwgICgCAK0gKX4iI0IgiCEuIAogLadJIAkgLKdJaiALICinSWogISAbRXFqIBkgE0VxaiAaIBRFcWogDiAbSWogByATSWogBSAUSWogECAISWogESAGSSAqQgGGpyIJciAiaiITaiIOIBIgBEkgK0IBhqciCnIgF2oiFGoiByAMIANJICVCAYanIgtyIBVqIhBqIgUgDSACSSAkQgGGpyIIciAWaiIRaiIGICOnIgRBAXQiEmoiASASSSEZIB8oAgCtICd+IiNCIIghLCABICOnIgNBAXQiDGoiASAMSSEaIBgoAgCtICZ+IiNCIIghKCABICOnIgJBAXQiDWoiASANSSEbIAogK6dJIAkgKqdJaiALICWnSWogCCAkp0lqICIgE0VxaiAOIBNJaiAXIBRFcWogByAUSWogFSAQRXFqIAUgEElqIBYgEUVxaiAGIBFJaiASIARJIC5CAYanIg5yIBlqIhVqIgogDCADSSAsQgGGpyIHciAaaiIWaiILIA0gAkkgKEIBhqciBXIgG2oiEGoiCCABIB4oAgCtIiQgJH4iI6ciAmoiASACSSAjQiCIp2oiBmohESAPIAE2AiAgICgCAK0iKSAcKAIArX4iI0IgiCEtIBEgI6ciBEEBdCIMaiIBIAxJIRMgHygCAK0iJyAdKAIArSImfiIjQiCIISogASAjpyIDQQF0Ig1qIgEgDUkhFCAYKAIArSIlICR+IiNCIIghJCABICOnIgJBAXQiCWoiASAJSSESIA8gATYCJCApICZ+IiNCIIghKyAHICynSSAOIC6nSWogBSAop0lqIBkgFUVxaiAaIBZFcWogGyAQRXFqIAogFUlqIAsgFklqIAggEElqIBEgBklqIAwgBEkgLUIBhqciB3IgE2oiDGoiCyANIANJICpCAYanIgVyIBRqIg1qIgggCSACSSAkQgGGpyIGciASaiIJaiIEICOnIgNBAXQiDmoiASAOSSEQICcgHigCAK0iJn4iI0IgiCEoIAEgI6ciAkEBdCIKaiIBIApJIREgBSAqp0kgByAtp0lqIAYgJKdJaiATIAxFcWogCyAMSWogFCANRXFqIAggDUlqIBIgCUVxaiAEIAlJaiAOIANJICtCAYanIgtyIBBqIhJqIgUgCiACSSAoQgGGpyIIciARaiIMaiIGIAEgJSAlfiIjpyICaiIBIAJJICNCIIinaiIEaiENIA8gATYCKCAgKAIArSInICZ+IiNCIIghJSANICOnIgNBAXQiB2oiASAHSSEJIB8oAgCtIiogGCgCAK0iJn4iI0IgiCEkIAEgI6ciAkEBdCIKaiIBIApJIQ4gDyABNgIsICcgJn4iI0IgiCEpIAggKKdJIAsgK6dJaiAQIBJFcWogESAMRXFqIAUgEklqIAYgDElqIA0gBElqIAcgA0kgJUIBhqciCHIgCWoiB2oiBiAKIAJJICRCAYanIgRyIA5qIgtqIgMgI6ciAkEBdCIFaiIBIAVJIQogBCAkp0kgCCAlp0lqIAkgB0VxaiAGIAdJaiAOIAtFcWogAyALSWogBSACSSApQgGGpyIGciAKaiIHaiIEIAEgKiAqfiIjpyICaiIBIAJJICNCIIinaiIDaiELIA8gATYCMCAgKAIArSInICp+IiNCIIghJiALICOnIgJBAXQiBWoiASAFSSEIIA8gATYCNCAPIAogB0VxIAYgKadJaiAEIAdJaiALIANJaiAFIAJJICZCAYanIgRyIAhqIgZqIgMgJyAnfiIjpyICaiIBNgI4IA8gBCAmp0kgI0IgiKdqIAggBkVxaiADIAZJaiABIAJJajYCPCAAIA8QLCAPJAQLKwAgAEH/AXFBGHQgAEEIdUH/AXFBEHRyIABBEHVB/wFxQQh0ciAAQRh2cgvPCQEbfiACKAIgrSIDIAEoAgStIgR+IAIoAiStIgYgASgCAK0iCH58IAIoAhytIgkgASgCCK0iCn58IAIoAhitIgsgASgCDK0iDH58IAIoAhStIg0gASgCEK0iDn58IAIoAhCtIg8gASgCFK0iEH58IAIoAgytIhEgASgCGK0iEn58IAIoAgitIhMgASgCHK0iFH58IAIoAgStIhUgASgCIK0iFn58IAIoAgCtIhcgASgCJK0iGH58IRwgCiADfiAEIAZ+fCAMIAl+fCAOIAt+fCAQIA1+fCASIA9+fCAUIBF+fCAWIBN+fCAYIBV+fCAcQhqIfCIbQv///x+DIhpCkPoAfiAXIAh+fCEdIBcgBH4gFSAIfnwgGkIKhnwgHUIaiHwgDCADfiAKIAZ+fCAOIAl+fCAQIAt+fCASIA1+fCAUIA9+fCAWIBF+fCAYIBN+fCAbQhqIfCIaQv///x+DIgVCkPoAfnwhGyAVIAR+IBMgCH58IBcgCn58IAVCCoZ8IA4gA34gDCAGfnwgECAJfnwgEiALfnwgFCANfnwgFiAPfnwgGCARfnwgGkIaiHwiBUL///8fgyIHQpD6AH58IBtCGoh8IRogACATIAR+IBEgCH58IBUgCn58IBcgDH58IAdCCoZ8IBAgA34gDiAGfnwgEiAJfnwgFCALfnwgFiANfnwgGCAPfnwgBUIaiHwiBUL///8fgyIHQpD6AH58IBpCGoh8IhmnQf///x9xNgIMIAAgESAEfiAPIAh+fCATIAp+fCAVIAx+fCAXIA5+fCAHQgqGfCASIAN+IBAgBn58IBQgCX58IBYgC358IBggDX58IAVCGoh8IgVC////H4MiB0KQ+gB+fCAZQhqIfCIZp0H///8fcTYCECAAIA8gBH4gDSAIfnwgESAKfnwgEyAMfnwgFSAOfnwgFyAQfnwgB0IKhnwgFCADfiASIAZ+fCAWIAl+fCAYIAt+fCAFQhqIfCIFQv///x+DIgdCkPoAfnwgGUIaiHwiGadB////H3E2AhQgACANIAR+IAsgCH58IA8gCn58IBEgDH58IBMgDn58IBUgEH58IBcgEn58IAdCCoZ8IBYgA34gFCAGfnwgGCAJfnwgBUIaiHwiBUL///8fgyIHQpD6AH58IBlCGoh8IhmnQf///x9xNgIYIAAgCyAEfiAJIAh+fCANIAp+fCAPIAx+fCARIA5+fCATIBB+fCAVIBJ+fCAXIBR+fCAHQgqGfCAYIAN+IBYgBn58IAVCGoh8IgVC////H4MiB0KQ+gB+fCAZQhqIfCIZp0H///8fcTYCHCAAIAkgBH4gAyAIfnwgCyAKfnwgDSAMfnwgDyAOfnwgESAQfnwgEyASfnwgFSAUfnwgFyAWfnwgB0IKhnwgBUIaiCAYIAZ+fCIDQv///x+DIgRCkPoAfnwgGUIaiHwiBqdB////H3E2AiAgACADQhqIIgNCkPoAfiAcQv///x+DfCAEQgqGfCAGQhqIfCIEp0H///8BcTYCJCAAIARCFoggA0IOhnwiA0LRB34gHUL///8fg3wiBKdB////H3E2AgAgACADQgaGIBtC////H4N8IARCGoh8IgOnQf///x9xNgIEIAAgA0IaiCAaQv///x+DfD4CCAvDAwEDfyACQYDAAE4EQCAAIAEgAhAGDwsgACEEIAAgAmohAyAAQQNxIAFBA3FGBEADQCAAQQNxBEAgAkUEQCAEDwsgACABLAAAOgAAIABBAWohACABQQFqIQEgAkEBayECDAELCyADQXxxIgJBQGohBQNAIAAgBUwEQCAAIAEoAgA2AgAgACABKAIENgIEIAAgASgCCDYCCCAAIAEoAgw2AgwgACABKAIQNgIQIAAgASgCFDYCFCAAIAEoAhg2AhggACABKAIcNgIcIAAgASgCIDYCICAAIAEoAiQ2AiQgACABKAIoNgIoIAAgASgCLDYCLCAAIAEoAjA2AjAgACABKAI0NgI0IAAgASgCODYCOCAAIAEoAjw2AjwgAEFAayEAIAFBQGshAQwBCwsDQCAAIAJIBEAgACABKAIANgIAIABBBGohACABQQRqIQEMAQsLBSADQQRrIQIDQCAAIAJIBEAgACABLAAAOgAAIAAgASwAAToAASAAIAEsAAI6AAIgACABLAADOgADIABBBGohACABQQRqIQEMAQsLCwNAIAAgA0gEQCAAIAEsAAA6AAAgAEEBaiEAIAFBAWohAQwBCwsgBAu/VgEkfyAAKAIAIR0gAEEEaiIeKAIAIQkgAEEIaiIfKAIAIQUgAEEMaiIgKAIAIQ8gAEEcaiIhKAIAQZjfqJQEaiAAQRBqIiIoAgAiAkEGdiACQRp0ciACQQt2IAJBFXRycyACQRl2IAJBB3Ryc2ogAEEYaiIjKAIAIgYgAEEUaiIkKAIAIgpzIAJxIAZzaiABKAIAEAkiF2oiByAPaiEPIAZBkYndiQdqIAEoAgQQCSIVaiAPIAogAnNxIApzaiAPQQZ2IA9BGnRyIA9BC3YgD0EVdHJzIA9BGXYgD0EHdHJzaiISIAVqIQYgCkHP94Oue2ogASgCCBAJIhhqIAYgDyACc3EgAnNqIAZBBnYgBkEadHIgBkELdiAGQRV0cnMgBkEZdiAGQQd0cnNqIhQgCWohCiACQaW3181+aiABKAIMEAkiFmogCiAGIA9zcSAPc2ogCkEGdiAKQRp0ciAKQQt2IApBFXRycyAKQRl2IApBB3Ryc2oiAiAdaiEDIB1BAnYgHUEedHIgHUENdiAdQRN0cnMgHUEWdiAdQQp0cnMgBSAJIB1ycSAJIB1xcmogB2oiBUECdiAFQR50ciAFQQ12IAVBE3RycyAFQRZ2IAVBCnRycyAFIB1yIAlxIAUgHXFyaiASaiIJQQJ2IAlBHnRyIAlBDXYgCUETdHJzIAlBFnYgCUEKdHJzIAkgBXIgHXEgCSAFcXJqIBRqIgdBAnYgB0EedHIgB0ENdiAHQRN0cnMgB0EWdiAHQQp0cnMgByAJciAFcSAHIAlxcmogAmohAiAPQduE28oDaiABKAIQEAkiGWogAyAKIAZzcSAGc2ogA0EGdiADQRp0ciADQQt2IANBFXRycyADQRl2IANBB3Ryc2oiEiAFaiEPIAEoAhQQCSIQQfGjxM8FaiAGaiAPIAMgCnNxIApzaiAPQQZ2IA9BGnRyIA9BC3YgD0EVdHJzIA9BGXYgD0EHdHJzaiIUIAlqIQYgASgCGBAJIghBpIX+kXlqIApqIAYgDyADc3EgA3NqIAZBBnYgBkEadHIgBkELdiAGQRV0cnMgBkEZdiAGQQd0cnNqIhMgB2ohCiABKAIcEAkiC0HVvfHYemogA2ogCiAGIA9zcSAPc2ogCkEGdiAKQRp0ciAKQQt2IApBFXRycyAKQRl2IApBB3Ryc2oiBCACaiEDIAJBAnYgAkEedHIgAkENdiACQRN0cnMgAkEWdiACQQp0cnMgAiAHciAJcSACIAdxcmogEmoiBUECdiAFQR50ciAFQQ12IAVBE3RycyAFQRZ2IAVBCnRycyAFIAJyIAdxIAUgAnFyaiAUaiIJQQJ2IAlBHnRyIAlBDXYgCUETdHJzIAlBFnYgCUEKdHJzIAkgBXIgAnEgCSAFcXJqIBNqIgdBAnYgB0EedHIgB0ENdiAHQRN0cnMgB0EWdiAHQQp0cnMgByAJciAFcSAHIAlxcmogBGohAiABKAIgEAkiDkGY1Z7AfWogD2ogAyAKIAZzcSAGc2ogA0EGdiADQRp0ciADQQt2IANBFXRycyADQRl2IANBB3Ryc2oiEiAFaiEPIAEoAiQQCSIMQYG2jZQBaiAGaiAPIAMgCnNxIApzaiAPQQZ2IA9BGnRyIA9BC3YgD0EVdHJzIA9BGXYgD0EHdHJzaiIUIAlqIQYgASgCKBAJIg1BvovGoQJqIApqIAYgDyADc3EgA3NqIAZBBnYgBkEadHIgBkELdiAGQRV0cnMgBkEZdiAGQQd0cnNqIhMgB2ohCiABKAIsEAkiEUHD+7GoBWogA2ogCiAGIA9zcSAPc2ogCkEGdiAKQRp0ciAKQQt2IApBFXRycyAKQRl2IApBB3Ryc2oiBCACaiEDIAJBAnYgAkEedHIgAkENdiACQRN0cnMgAkEWdiACQQp0cnMgAiAHciAJcSACIAdxcmogEmoiBUECdiAFQR50ciAFQQ12IAVBE3RycyAFQRZ2IAVBCnRycyAFIAJyIAdxIAUgAnFyaiAUaiIJQQJ2IAlBHnRyIAlBDXYgCUETdHJzIAlBFnYgCUEKdHJzIAkgBXIgAnEgCSAFcXJqIBNqIgdBAnYgB0EedHIgB0ENdiAHQRN0cnMgB0EWdiAHQQp0cnMgByAJciAFcSAHIAlxcmogBGohAiABKAIwEAkiGkH0uvmVB2ogD2ogAyAKIAZzcSAGc2ogA0EGdiADQRp0ciADQQt2IANBFXRycyADQRl2IANBB3Ryc2oiBCAFaiEFIAEoAjQQCSIbQf7j+oZ4aiAGaiAFIAMgCnNxIApzaiAFQQZ2IAVBGnRyIAVBC3YgBUEVdHJzIAVBGXYgBUEHdHJzaiIGIAlqIRIgASgCOBAJIg9Bp43w3nlqIApqIBIgBSADc3EgA3NqIBJBBnYgEkEadHIgEkELdiASQRV0cnMgEkEZdiASQQd0cnNqIgogB2ohFCABKAI8EAkiAUH04u+MfGogA2ogFCASIAVzcSAFc2ogFEEGdiAUQRp0ciAUQQt2IBRBFXRycyAUQRl2IBRBB3Ryc2oiHCACaiETIAJBAnYgAkEedHIgAkENdiACQRN0cnMgAkEWdiACQQp0cnMgAiAHciAJcSACIAdxcmogBGoiA0ECdiADQR50ciADQQ12IANBE3RycyADQRZ2IANBCnRycyADIAJyIAdxIAMgAnFyaiAGaiIJQQJ2IAlBHnRyIAlBDXYgCUETdHJzIAlBFnYgCUEKdHJzIAkgA3IgAnEgCSADcXJqIApqIgdBAnYgB0EedHIgB0ENdiAHQRN0cnMgB0EWdiAHQQp0cnMgByAJciADcSAHIAlxcmogHGohAiAYQRJ2IBhBDnRyIBhBA3ZzIBhBB3YgGEEZdHJzIBVqIA1qIAFBE3YgAUENdHIgAUEKdnMgAUERdiABQQ90cnNqIgZBho/5/X5qIBJqIBVBEnYgFUEOdHIgFUEDdnMgFUEHdiAVQRl0cnMgF2ogDGogD0ETdiAPQQ10ciAPQQp2cyAPQRF2IA9BD3Ryc2oiCkHB0+2kfmogBWogEyAUIBJzcSASc2ogE0EGdiATQRp0ciATQQt2IBNBFXRycyATQRl2IBNBB3Ryc2oiFSADaiIXIBMgFHNxIBRzaiAXQQZ2IBdBGnRyIBdBC3YgF0EVdHJzIBdBGXYgF0EHdHJzaiIEIAlqIRIgGUESdiAZQQ50ciAZQQN2cyAZQQd2IBlBGXRycyAWaiAaaiAGQRN2IAZBDXRyIAZBCnZzIAZBEXYgBkEPdHJzaiIDQczDsqACaiATaiAWQRJ2IBZBDnRyIBZBA3ZzIBZBB3YgFkEZdHJzIBhqIBFqIApBE3YgCkENdHIgCkEKdnMgCkERdiAKQQ90cnNqIgVBxruG/gBqIBRqIBIgFyATc3EgE3NqIBJBBnYgEkEadHIgEkELdiASQRV0cnMgEkEZdiASQQd0cnNqIhggB2oiFiASIBdzcSAXc2ogFkEGdiAWQRp0ciAWQQt2IBZBFXRycyAWQRl2IBZBB3Ryc2oiHCACaiETIAJBAnYgAkEedHIgAkENdiACQRN0cnMgAkEWdiACQQp0cnMgAiAHciAJcSACIAdxcmogFWoiFEECdiAUQR50ciAUQQ12IBRBE3RycyAUQRZ2IBRBCnRycyAUIAJyIAdxIBQgAnFyaiAEaiIVQQJ2IBVBHnRyIBVBDXYgFUETdHJzIBVBFnYgFUEKdHJzIBUgFHIgAnEgFSAUcXJqIBhqIhhBAnYgGEEedHIgGEENdiAYQRN0cnMgGEEWdiAYQQp0cnMgGCAVciAUcSAYIBVxcmogHGohAiAIQRJ2IAhBDnRyIAhBA3ZzIAhBB3YgCEEZdHJzIBBqIA9qIANBE3YgA0ENdHIgA0EKdnMgA0ERdiADQQ90cnNqIglBqonS0wRqIBJqIBBBEnYgEEEOdHIgEEEDdnMgEEEHdiAQQRl0cnMgGWogG2ogBUETdiAFQQ10ciAFQQp2cyAFQRF2IAVBD3Ryc2oiB0Hv2KTvAmogF2ogEyAWIBJzcSASc2ogE0EGdiATQRp0ciATQQt2IBNBFXRycyATQRl2IBNBB3Ryc2oiGSAUaiIEIBMgFnNxIBZzaiAEQQZ2IARBGnRyIARBC3YgBEEVdHJzIARBGXYgBEEHdHJzaiIQIBVqIRcgDkESdiAOQQ50ciAOQQN2cyAOQQd2IA5BGXRycyALaiAKaiAJQRN2IAlBDXRyIAlBCnZzIAlBEXYgCUEPdHJzaiISQdqR5rcHaiATaiALQRJ2IAtBDnRyIAtBA3ZzIAtBB3YgC0EZdHJzIAhqIAFqIAdBE3YgB0ENdHIgB0EKdnMgB0ERdiAHQQ90cnNqIhRB3NPC5QVqIBZqIBcgBCATc3EgE3NqIBdBBnYgF0EadHIgF0ELdiAXQRV0cnMgF0EZdiAXQQd0cnNqIhMgGGoiCyAXIARzcSAEc2ogC0EGdiALQRp0ciALQQt2IAtBFXRycyALQRl2IAtBB3Ryc2oiHCACaiEWIAJBAnYgAkEedHIgAkENdiACQRN0cnMgAkEWdiACQQp0cnMgAiAYciAVcSACIBhxcmogGWoiGUECdiAZQR50ciAZQQ12IBlBE3RycyAZQRZ2IBlBCnRycyAZIAJyIBhxIBkgAnFyaiAQaiIQQQJ2IBBBHnRyIBBBDXYgEEETdHJzIBBBFnYgEEEKdHJzIBAgGXIgAnEgECAZcXJqIBNqIghBAnYgCEEedHIgCEENdiAIQRN0cnMgCEEWdiAIQQp0cnMgCCAQciAZcSAIIBBxcmogHGohAiANQRJ2IA1BDnRyIA1BA3ZzIA1BB3YgDUEZdHJzIAxqIAVqIBJBE3YgEkENdHIgEkEKdnMgEkERdiASQQ90cnNqIhNB7YzHwXpqIBdqIAxBEnYgDEEOdHIgDEEDdnMgDEEHdiAMQRl0cnMgDmogBmogFEETdiAUQQ10ciAUQQp2cyAUQRF2IBRBD3Ryc2oiFUHSovnBeWogBGogFiALIBdzcSAXc2ogFkEGdiAWQRp0ciAWQQt2IBZBFXRycyAWQRl2IBZBB3Ryc2oiDCAZaiIOIBYgC3NxIAtzaiAOQQZ2IA5BGnRyIA5BC3YgDkEVdHJzIA5BGXYgDkEHdHJzaiIZIBBqIQQgGkESdiAaQQ50ciAaQQN2cyAaQQd2IBpBGXRycyARaiAHaiATQRN2IBNBDXRyIBNBCnZzIBNBEXYgE0EPdHJzaiIYQcf/5fp7aiAWaiARQRJ2IBFBDnRyIBFBA3ZzIBFBB3YgEUEZdHJzIA1qIANqIBVBE3YgFUENdHIgFUEKdnMgFUERdiAVQQ90cnNqIhdByM+MgHtqIAtqIAQgDiAWc3EgFnNqIARBBnYgBEEadHIgBEELdiAEQRV0cnMgBEEZdiAEQQd0cnNqIhYgCGoiDSAEIA5zcSAOc2ogDUEGdiANQRp0ciANQQt2IA1BFXRycyANQRl2IA1BB3Ryc2oiESACaiELIAJBAnYgAkEedHIgAkENdiACQRN0cnMgAkEWdiACQQp0cnMgAiAIciAQcSACIAhxcmogDGoiEEECdiAQQR50ciAQQQ12IBBBE3RycyAQQRZ2IBBBCnRycyAQIAJyIAhxIBAgAnFyaiAZaiIIQQJ2IAhBHnRyIAhBDXYgCEETdHJzIAhBFnYgCEEKdHJzIAggEHIgAnEgCCAQcXJqIBZqIgxBAnYgDEEedHIgDEENdiAMQRN0cnMgDEEWdiAMQQp0cnMgDCAIciAQcSAMIAhxcmogEWohAiAPQRJ2IA9BDnRyIA9BA3ZzIA9BB3YgD0EZdHJzIBtqIBRqIBhBE3YgGEENdHIgGEEKdnMgGEERdiAYQQ90cnNqIhZBx6KerX1qIARqIBtBEnYgG0EOdHIgG0EDdnMgG0EHdiAbQRl0cnMgGmogCWogF0ETdiAXQQ10ciAXQQp2cyAXQRF2IBdBD3Ryc2oiGUHzl4C3fGogDmogCyANIARzcSAEc2ogC0EGdiALQRp0ciALQQt2IAtBFXRycyALQRl2IAtBB3Ryc2oiDiAQaiIRIAsgDXNxIA1zaiARQQZ2IBFBGnRyIBFBC3YgEUEVdHJzIBFBGXYgEUEHdHJzaiIaIAhqIQQgCkESdiAKQQ50ciAKQQN2cyAKQQd2IApBGXRycyABaiAVaiAWQRN2IBZBDXRyIBZBCnZzIBZBEXYgFkEPdHJzaiIQQefSpKEBaiALaiABQRJ2IAFBDnRyIAFBA3ZzIAFBB3YgAUEZdHJzIA9qIBJqIBlBE3YgGUENdHIgGUEKdnMgGUERdiAZQQ90cnNqIgFB0capNmogDWogBCARIAtzcSALc2ogBEEGdiAEQRp0ciAEQQt2IARBFXRycyAEQRl2IARBB3Ryc2oiDyAMaiINIAQgEXNxIBFzaiANQQZ2IA1BGnRyIA1BC3YgDUEVdHJzIA1BGXYgDUEHdHJzaiIbIAJqIQsgAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIAxyIAhxIAIgDHFyaiAOaiIIQQJ2IAhBHnRyIAhBDXYgCEETdHJzIAhBFnYgCEEKdHJzIAggAnIgDHEgCCACcXJqIBpqIgxBAnYgDEEedHIgDEENdiAMQRN0cnMgDEEWdiAMQQp0cnMgDCAIciACcSAMIAhxcmogD2oiDkECdiAOQR50ciAOQQ12IA5BE3RycyAOQRZ2IA5BCnRycyAOIAxyIAhxIA4gDHFyaiAbaiECIAVBEnYgBUEOdHIgBUEDdnMgBUEHdiAFQRl0cnMgBmogF2ogEEETdiAQQQ10ciAQQQp2cyAQQRF2IBBBD3Ryc2oiD0G4wuzwAmogBGogBkESdiAGQQ50ciAGQQN2cyAGQQd2IAZBGXRycyAKaiATaiABQRN2IAFBDXRyIAFBCnZzIAFBEXYgAUEPdHJzaiIGQYWV3L0CaiARaiALIA0gBHNxIARzaiALQQZ2IAtBGnRyIAtBC3YgC0EVdHJzIAtBGXYgC0EHdHJzaiIaIAhqIhEgCyANc3EgDXNqIBFBBnYgEUEadHIgEUELdiARQRV0cnMgEUEZdiARQQd0cnNqIhsgDGohCCAHQRJ2IAdBDnRyIAdBA3ZzIAdBB3YgB0EZdHJzIANqIBlqIA9BE3YgD0ENdHIgD0EKdnMgD0ERdiAPQQ90cnNqIgpBk5rgmQVqIAtqIANBEnYgA0EOdHIgA0EDdnMgA0EHdiADQRl0cnMgBWogGGogBkETdiAGQQ10ciAGQQp2cyAGQRF2IAZBD3Ryc2oiA0H827HpBGogDWogCCARIAtzcSALc2ogCEEGdiAIQRp0ciAIQQt2IAhBFXRycyAIQRl2IAhBB3Ryc2oiBSAOaiINIAggEXNxIBFzaiANQQZ2IA1BGnRyIA1BC3YgDUEVdHJzIA1BGXYgDUEHdHJzaiIcIAJqIQQgAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIA5yIAxxIAIgDnFyaiAaaiILQQJ2IAtBHnRyIAtBDXYgC0ETdHJzIAtBFnYgC0EKdHJzIAsgAnIgDnEgCyACcXJqIBtqIgxBAnYgDEEedHIgDEENdiAMQRN0cnMgDEEWdiAMQQp0cnMgDCALciACcSAMIAtxcmogBWoiDkECdiAOQR50ciAOQQ12IA5BE3RycyAOQRZ2IA5BCnRycyAOIAxyIAtxIA4gDHFyaiAcaiECIBRBEnYgFEEOdHIgFEEDdnMgFEEHdiAUQRl0cnMgCWogAWogCkETdiAKQQ10ciAKQQp2cyAKQRF2IApBD3Ryc2oiBUG7laizB2ogCGogCUESdiAJQQ50ciAJQQN2cyAJQQd2IAlBGXRycyAHaiAWaiADQRN2IANBDXRyIANBCnZzIANBEXYgA0EPdHJzaiIJQdTmqagGaiARaiAEIA0gCHNxIAhzaiAEQQZ2IARBGnRyIARBC3YgBEEVdHJzIARBGXYgBEEHdHJzaiIaIAtqIhEgBCANc3EgDXNqIBFBBnYgEUEadHIgEUELdiARQRV0cnMgEUEZdiARQQd0cnNqIhsgDGohCCAVQRJ2IBVBDnRyIBVBA3ZzIBVBB3YgFUEZdHJzIBJqIAZqIAVBE3YgBUENdHIgBUEKdnMgBUERdiAFQQ90cnNqIgdBhdnIk3lqIARqIBJBEnYgEkEOdHIgEkEDdnMgEkEHdiASQRl0cnMgFGogEGogCUETdiAJQQ10ciAJQQp2cyAJQRF2IAlBD3Ryc2oiEkGukouOeGogDWogCCARIARzcSAEc2ogCEEGdiAIQRp0ciAIQQt2IAhBFXRycyAIQRl2IAhBB3Ryc2oiFCAOaiINIAggEXNxIBFzaiANQQZ2IA1BGnRyIA1BC3YgDUEVdHJzIA1BGXYgDUEHdHJzaiIcIAJqIQQgAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIA5yIAxxIAIgDnFyaiAaaiILQQJ2IAtBHnRyIAtBDXYgC0ETdHJzIAtBFnYgC0EKdHJzIAsgAnIgDnEgCyACcXJqIBtqIgxBAnYgDEEedHIgDEENdiAMQRN0cnMgDEEWdiAMQQp0cnMgDCALciACcSAMIAtxcmogFGoiDkECdiAOQR50ciAOQQ12IA5BE3RycyAOQRZ2IA5BCnRycyAOIAxyIAtxIA4gDHFyaiAcaiECIBdBEnYgF0EOdHIgF0EDdnMgF0EHdiAXQRl0cnMgE2ogA2ogB0ETdiAHQQ10ciAHQQp2cyAHQRF2IAdBD3Ryc2oiFEHLzOnAemogCGogE0ESdiATQQ50ciATQQN2cyATQQd2IBNBGXRycyAVaiAPaiASQRN2IBJBDXRyIBJBCnZzIBJBEXYgEkEPdHJzaiITQaHR/5V6aiARaiAEIA0gCHNxIAhzaiAEQQZ2IARBGnRyIARBC3YgBEEVdHJzIARBGXYgBEEHdHJzaiIaIAtqIhEgBCANc3EgDXNqIBFBBnYgEUEadHIgEUELdiARQRV0cnMgEUEZdiARQQd0cnNqIhsgDGohCCAZQRJ2IBlBDnRyIBlBA3ZzIBlBB3YgGUEZdHJzIBhqIAlqIBRBE3YgFEENdHIgFEEKdnMgFEERdiAUQQ90cnNqIhVBo6Oxu3xqIARqIBhBEnYgGEEOdHIgGEEDdnMgGEEHdiAYQRl0cnMgF2ogCmogE0ETdiATQQ10ciATQQp2cyATQRF2IBNBD3Ryc2oiGEHwlq6SfGogDWogCCARIARzcSAEc2ogCEEGdiAIQRp0ciAIQQt2IAhBFXRycyAIQRl2IAhBB3Ryc2oiFyAOaiINIAggEXNxIBFzaiANQQZ2IA1BGnRyIA1BC3YgDUEVdHJzIA1BGXYgDUEHdHJzaiIcIAJqIQQgAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIA5yIAxxIAIgDnFyaiAaaiILQQJ2IAtBHnRyIAtBDXYgC0ETdHJzIAtBFnYgC0EKdHJzIAsgAnIgDnEgCyACcXJqIBtqIgxBAnYgDEEedHIgDEENdiAMQRN0cnMgDEEWdiAMQQp0cnMgDCALciACcSAMIAtxcmogF2oiDkECdiAOQR50ciAOQQ12IA5BE3RycyAOQRZ2IA5BCnRycyAOIAxyIAtxIA4gDHFyaiAcaiECIAFBEnYgAUEOdHIgAUEDdnMgAUEHdiABQRl0cnMgFmogEmogFUETdiAVQQ10ciAVQQp2cyAVQRF2IBVBD3Ryc2oiF0GkjOS0fWogCGogFkESdiAWQQ50ciAWQQN2cyAWQQd2IBZBGXRycyAZaiAFaiAYQRN2IBhBDXRyIBhBCnZzIBhBEXYgGEEPdHJzaiIWQZnQy4x9aiARaiAEIA0gCHNxIAhzaiAEQQZ2IARBGnRyIARBC3YgBEEVdHJzIARBGXYgBEEHdHJzaiIaIAtqIhEgBCANc3EgDXNqIBFBBnYgEUEadHIgEUELdiARQRV0cnMgEUEZdiARQQd0cnNqIgsgDGohCCAGQRJ2IAZBDnRyIAZBA3ZzIAZBB3YgBkEZdHJzIBBqIBNqIBdBE3YgF0ENdHIgF0EKdnMgF0ERdiAXQQ90cnNqIhlB8MCqgwFqIARqIBBBEnYgEEEOdHIgEEEDdnMgEEEHdiAQQRl0cnMgAWogB2ogFkETdiAWQQ10ciAWQQp2cyAWQRF2IBZBD3Ryc2oiAUGF67igf2ogDWogCCARIARzcSAEc2ogCEEGdiAIQRp0ciAIQQt2IAhBFXRycyAIQRl2IAhBB3Ryc2oiGyAOaiINIAggEXNxIBFzaiANQQZ2IA1BGnRyIA1BC3YgDUEVdHJzIA1BGXYgDUEHdHJzaiIcIAJqIRAgAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIA5yIAxxIAIgDnFyaiAaaiIEQQJ2IARBHnRyIARBDXYgBEETdHJzIARBFnYgBEEKdHJzIAQgAnIgDnEgBCACcXJqIAtqIgtBAnYgC0EedHIgC0ENdiALQRN0cnMgC0EWdiALQQp0cnMgCyAEciACcSALIARxcmogG2oiDEECdiAMQR50ciAMQQ12IAxBE3RycyAMQRZ2IAxBCnRycyAMIAtyIARxIAwgC3FyaiAcaiECIANBEnYgA0EOdHIgA0EDdnMgA0EHdiADQRl0cnMgD2ogGGogGUETdiAZQQ10ciAZQQp2cyAZQRF2IBlBD3Ryc2oiGkGI2N3xAWogCGogD0ESdiAPQQ50ciAPQQN2cyAPQQd2IA9BGXRycyAGaiAUaiABQRN2IAFBDXRyIAFBCnZzIAFBEXYgAUEPdHJzaiIPQZaCk80BaiARaiAQIA0gCHNxIAhzaiAQQQZ2IBBBGnRyIBBBC3YgEEEVdHJzIBBBGXYgEEEHdHJzaiIIIARqIgQgECANc3EgDXNqIARBBnYgBEEadHIgBEELdiAEQRV0cnMgBEEZdiAEQQd0cnNqIhwgC2ohBiAJQRJ2IAlBDnRyIAlBA3ZzIAlBB3YgCUEZdHJzIApqIBZqIBpBE3YgGkENdHIgGkEKdnMgGkERdiAaQQ90cnNqIhFBtfnCpQNqIBBqIApBEnYgCkEOdHIgCkEDdnMgCkEHdiAKQRl0cnMgA2ogFWogD0ETdiAPQQ10ciAPQQp2cyAPQRF2IA9BD3Ryc2oiG0HM7qG6AmogDWogBiAEIBBzcSAQc2ogBkEGdiAGQRp0ciAGQQt2IAZBFXRycyAGQRl2IAZBB3Ryc2oiDSAMaiIOIAYgBHNxIARzaiAOQQZ2IA5BGnRyIA5BC3YgDkEVdHJzIA5BGXYgDkEHdHJzaiIlIAJqIQogAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIAxyIAtxIAIgDHFyaiAIaiIDQQJ2IANBHnRyIANBDXYgA0ETdHJzIANBFnYgA0EKdHJzIAMgAnIgDHEgAyACcXJqIBxqIhBBAnYgEEEedHIgEEENdiAQQRN0cnMgEEEWdiAQQQp0cnMgECADciACcSAQIANxcmogDWoiCEECdiAIQR50ciAIQQ12IAhBE3RycyAIQRZ2IAhBCnRycyAIIBByIANxIAggEHFyaiAlaiECIBJBEnYgEkEOdHIgEkEDdnMgEkEHdiASQRl0cnMgBWogAWogEUETdiARQQ10ciARQQp2cyARQRF2IBFBD3Ryc2oiC0HK1OL2BGogBmogBUESdiAFQQ50ciAFQQN2cyAFQQd2IAVBGXRycyAJaiAXaiAbQRN2IBtBDXRyIBtBCnZzIBtBEXYgG0EPdHJzaiIMQbOZ8MgDaiAEaiAKIA4gBnNxIAZzaiAKQQZ2IApBGnRyIApBC3YgCkEVdHJzIApBGXYgCkEHdHJzaiIFIANqIgQgCiAOc3EgDnNqIARBBnYgBEEadHIgBEELdiAEQRV0cnMgBEEZdiAEQQd0cnNqIgkgEGohBiATQRJ2IBNBDnRyIBNBA3ZzIBNBB3YgE0EZdHJzIAdqIA9qIAtBE3YgC0ENdHIgC0EKdnMgC0ERdiALQQ90cnNqIg1B89+5wQZqIApqIAdBEnYgB0EOdHIgB0EDdnMgB0EHdiAHQRl0cnMgEmogGWogDEETdiAMQQ10ciAMQQp2cyAMQRF2IAxBD3Ryc2oiHEHPlPPcBWogDmogBiAEIApzcSAKc2ogBkEGdiAGQRp0ciAGQQt2IAZBFXRycyAGQRl2IAZBB3Ryc2oiEiAIaiIHIAYgBHNxIARzaiAHQQZ2IAdBGnRyIAdBC3YgB0EVdHJzIAdBGXYgB0EHdHJzaiIOIAJqIQogAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIAhyIBBxIAIgCHFyaiAFaiIDQQJ2IANBHnRyIANBDXYgA0ETdHJzIANBFnYgA0EKdHJzIAMgAnIgCHEgAyACcXJqIAlqIgVBAnYgBUEedHIgBUENdiAFQRN0cnMgBUEWdiAFQQp0cnMgBSADciACcSAFIANxcmogEmoiCUECdiAJQR50ciAJQQ12IAlBE3RycyAJQRZ2IAlBCnRycyAJIAVyIANxIAkgBXFyaiAOaiECIBhBEnYgGEEOdHIgGEEDdnMgGEEHdiAYQRl0cnMgFGogG2ogDUETdiANQQ10ciANQQp2cyANQRF2IA1BD3Ryc2oiEEHvxpXFB2ogBmogFEESdiAUQQ50ciAUQQN2cyAUQQd2IBRBGXRycyATaiAaaiAcQRN2IBxBDXRyIBxBCnZzIBxBEXYgHEEPdHJzaiIUQe6FvqQHaiAEaiAKIAcgBnNxIAZzaiAKQQZ2IApBGnRyIApBC3YgCkEVdHJzIApBGXYgCkEHdHJzaiIIIANqIhIgCiAHc3EgB3NqIBJBBnYgEkEadHIgEkELdiASQRV0cnMgEkEZdiASQQd0cnNqIgQgBWohBiAWQRJ2IBZBDnRyIBZBA3ZzIBZBB3YgFkEZdHJzIBVqIAxqIBBBE3YgEEENdHIgEEEKdnMgEEERdiAQQQ90cnNqIhNBiISc5nhqIApqIBVBEnYgFUEOdHIgFUEDdnMgFUEHdiAVQRl0cnMgGGogEWogFEETdiAUQQ10ciAUQQp2cyAUQRF2IBRBD3Ryc2oiFUGU8KGmeGogB2ogBiASIApzcSAKc2ogBkEGdiAGQRp0ciAGQQt2IAZBFXRycyAGQRl2IAZBB3Ryc2oiGCAJaiIHIAYgEnNxIBJzaiAHQQZ2IAdBGnRyIAdBC3YgB0EVdHJzIAdBGXYgB0EHdHJzaiIQIAJqIQogAkECdiACQR50ciACQQ12IAJBE3RycyACQRZ2IAJBCnRycyACIAlyIAVxIAIgCXFyaiAIaiIDQQJ2IANBHnRyIANBDXYgA0ETdHJzIANBFnYgA0EKdHJzIAMgAnIgCXEgAyACcXJqIARqIgVBAnYgBUEedHIgBUENdiAFQRN0cnMgBUEWdiAFQQp0cnMgBSADciACcSAFIANxcmogGGoiCUECdiAJQR50ciAJQQ12IAlBE3RycyAJQRZ2IAlBCnRycyAJIAVyIANxIAkgBXFyaiAQaiECIAFBEnYgAUEOdHIgAUEDdnMgAUEHdiABQRl0cnMgF2ogHGogE0ETdiATQQ10ciATQQp2cyATQRF2IBNBD3Ryc2oiE0Hr2cGiemogBmogF0ESdiAXQQ50ciAXQQN2cyAXQQd2IBdBGXRycyAWaiALaiAVQRN2IBVBDXRyIBVBCnZzIBVBEXYgFUEPdHJzaiIVQfr/+4V5aiASaiAKIAcgBnNxIAZzaiAKQQZ2IApBGnRyIApBC3YgCkEVdHJzIApBGXYgCkEHdHJzaiISIANqIgYgCiAHc3EgB3NqIAZBBnYgBkEadHIgBkELdiAGQRV0cnMgBkEZdiAGQQd0cnNqIhggBWohAyABQffH5vd7aiAZQRJ2IBlBDnRyIBlBA3ZzIBlBB3YgGUEZdHJzaiANaiAVQRN2IBVBDXRyIBVBCnZzIBVBEXYgFUEPdHJzaiAHaiADIAYgCnNxIApzaiADQQZ2IANBGnRyIANBC3YgA0EVdHJzIANBGXYgA0EHdHJzaiIVIAlqIQcgACACQQJ2IAJBHnRyIAJBDXYgAkETdHJzIAJBFnYgAkEKdHJzIAIgCXIgBXEgAiAJcXJqIBJqIgBBAnYgAEEedHIgAEENdiAAQRN0cnMgAEEWdiAAQQp0cnMgACACciAJcSAAIAJxcmogGGoiAUECdiABQR50ciABQQ12IAFBE3RycyABQRZ2IAFBCnRycyABIAByIAJxIAEgAHFyaiAVaiIFIAFyIABxIAUgAXFyIB1qIAVBAnYgBUEedHIgBUENdiAFQRN0cnMgBUEWdiAFQQp0cnNqIBlB8vHFs3xqIA9BEnYgD0EOdHIgD0EDdnMgD0EHdiAPQRl0cnNqIBRqIBNBE3YgE0ENdHIgE0EKdnMgE0ERdiATQQ90cnNqIApqIAcgAyAGc3EgBnNqIAdBBnYgB0EadHIgB0ELdiAHQRV0cnMgB0EZdiAHQQd0cnNqIh1qNgIAIB4gBSAeKAIAajYCACAfIAEgHygCAGo2AgAgICAAICAoAgBqNgIAICIgAiAiKAIAaiAdajYCACAkIAcgJCgCAGo2AgAgIyADICMoAgBqNgIAICEgBiAhKAIAajYCAAveFgIefwl+IwQhCyMEQUBrJAQgCyACKAIArSIjIAEoAgCtIid+IiE+AgAgAkEEaiIYKAIArSImICd+IiKnIgYgIUIgiKdqIgUgIyABQQRqIhkoAgCtIiV+IiGnIgRqIgMgBEkgIUIgiKdqIQcgCyADNgIEIAUgBkkgIkIgiKdqIAdqIgUgAkEIaiIRKAIArSIkICd+IiGnIgRqIgMgBEkgIUIgiKdqIgkgBSAHSWoiByADICYgJX4iIaciBGoiAyAESSAhQiCIp2oiBmoiBSADICMgAUEIaiIaKAIArSIifiIhpyIDaiIEIANJICFCIIinaiIDaiEIIAsgBDYCCCAFIAZJIAcgCUlqIAggA0lqIAggAkEMaiISKAIArSIjICd+IiGnIgRqIgMgBEkgIUIgiKdqIghqIgkgAyAkICV+IiGnIgRqIgMgBEkgIUIgiKdqIgdqIgYgAyAmICJ+IiGnIgRqIgMgBEkgIUIgiKdqIgVqIQogAyACKAIArSIpIAFBDGoiGygCAK0iIn4iIaciA2oiBCADSSAhQiCIp2oiAyAKaiEMIAsgBDYCDCAGIAdJIAkgCElqIAogBUlqIAwgA0lqIAwgAkEQaiITKAIArSIoIAEoAgCtIid+IiGnIgRqIgMgBEkgIUIgiKdqIgxqIgggAyAjIBkoAgCtIiZ+IiGnIgRqIgMgBEkgIUIgiKdqIglqIgcgAyARKAIArSIlIBooAgCtIiN+IiGnIgRqIgMgBEkgIUIgiKdqIgZqIQ0gAyAYKAIArSIkICJ+IiGnIgRqIgMgBEkgIUIgiKdqIgUgDWohDiADICkgAUEQaiIcKAIArSIifiIhpyIDaiIEIANJICFCIIinaiIDIA5qIQogCyAENgIQIAcgCUkgCCAMSWogDSAGSWogDiAFSWogCiADSWogCiACQRRqIhQoAgCtICd+IiGnIgRqIgMgBEkgIUIgiKdqIgpqIgwgAyAoICZ+IiGnIgRqIgMgBEkgIUIgiKdqIghqIgkgAyASKAIArSAjfiIhpyIEaiIDIARJICFCIIinaiIHaiEPIAMgJSAbKAIArSIjfiIhpyIEaiIDIARJICFCIIinaiIGIA9qIRAgAyAkICJ+IiGnIgRqIgMgBEkgIUIgiKdqIgUgEGohDSADIAIoAgCtIAFBFGoiHSgCAK0iIn4iIaciA2oiBCADSSAhQiCIp2oiAyANaiEOIAsgBDYCFCAJIAhJIAwgCklqIA8gB0lqIBAgBklqIA0gBUlqIA4gA0lqIA4gAkEYaiIVKAIArSABKAIArX4iIaciBGoiAyAESSAhQiCIp2oiDmoiCiADIBQoAgCtIBkoAgCtfiIhpyIEaiIDIARJICFCIIinaiIMaiIIIAMgEygCAK0gGigCAK1+IiGnIgRqIgMgBEkgIUIgiKdqIglqIRYgAyASKAIArSAjfiIhpyIEaiIDIARJICFCIIinaiIHIBZqIRcgAyARKAIArSAcKAIArX4iIaciBGoiAyAESSAhQiCIp2oiBiAXaiEPIAMgGCgCAK0gIn4iIaciBGoiAyAESSAhQiCIp2oiBSAPaiEQIAMgAigCAK0gAUEYaiIeKAIArX4iIaciA2oiBCADSSAhQiCIp2oiAyAQaiENIAsgBDYCGCAIIAxJIAogDklqIBYgCUlqIBcgB0lqIA8gBklqIBAgBUlqIA0gA0lqIA0gAkEcaiIfKAIArSABKAIArX4iIaciBGoiAyAESSAhQiCIp2oiDmoiCiADIBUoAgCtIBkoAgCtfiIhpyIEaiIDIARJICFCIIinaiIMaiIIIAMgFCgCAK0gGigCAK1+IiGnIgRqIgMgBEkgIUIgiKdqIglqIRYgAyATKAIArSAbKAIArX4iIaciBGoiAyAESSAhQiCIp2oiByAWaiEXIAMgEigCAK0gHCgCAK1+IiGnIgRqIgMgBEkgIUIgiKdqIgYgF2ohDyADIBEoAgCtIB0oAgCtfiIhpyIEaiIDIARJICFCIIinaiIFIA9qIRAgAyAYKAIArSAeKAIArX4iIaciA2oiBCADSSAhQiCIp2oiAyAQaiENIAQgAigCAK0gAUEcaiIgKAIArX4iIaciAWoiAiABSSAhQiCIp2oiASANaiEEIAsgAjYCHCAIIAxJIAogDklqIBYgCUlqIBcgB0lqIA8gBklqIBAgBUlqIA0gA0lqIAQgAUlqIAQgHygCAK0gGSgCAK1+IiGnIgJqIgEgAkkgIUIgiKdqIgxqIgggASAVKAIArSAaKAIArSIjfiIhpyICaiIBIAJJICFCIIinaiIJaiIHIAEgFCgCAK0gGygCAK0iIn4iIaciAmoiASACSSAhQiCIp2oiBmohDyABIBMoAgCtIBwoAgCtIiV+IiGnIgJqIgEgAkkgIUIgiKdqIgUgD2ohECABIBIoAgCtIB0oAgCtIiR+IiGnIgJqIgEgAkkgIUIgiKdqIgQgEGohDSABIBEoAgCtIB4oAgCtIih+IiGnIgJqIgEgAkkgIUIgiKdqIgMgDWohDiABIBgoAgCtICAoAgCtIid+IiGnIgFqIgIgAUkgIUIgiKdqIgEgDmohCiALIAI2AiAgByAJSSAIIAxJaiAPIAZJaiAQIAVJaiANIARJaiAOIANJaiAKIAFJaiAKIB8oAgCtIiYgI34iIaciAmoiASACSSAhQiCIp2oiCGoiCSABIBUoAgCtIiMgIn4iIaciAmoiASACSSAhQiCIp2oiB2oiBiABIBQoAgCtIiIgJX4iIaciAmoiASACSSAhQiCIp2oiBWohDSABIBMoAgCtIiUgJH4iIaciAmoiASACSSAhQiCIp2oiBCANaiEOIAEgEigCAK0iJCAofiIhpyICaiIBIAJJICFCIIinaiIDIA5qIQogASARKAIArSAnfiIhpyIBaiICIAFJICFCIIinaiIBIApqIQwgCyACNgIkIAYgB0kgCSAISWogDSAFSWogDiAESWogCiADSWogDCABSWogDCAmIBsoAgCtfiIhpyICaiIBIAJJICFCIIinaiIJaiIHIAEgIyAcKAIArSIjfiIhpyICaiIBIAJJICFCIIinaiIGaiIFIAEgIiAdKAIArSIifiIhpyICaiIBIAJJICFCIIinaiIEaiEKIAEgJSAeKAIArSImfiIhpyICaiIBIAJJICFCIIinaiIDIApqIQwgASAkICAoAgCtIiV+IiGnIgFqIgIgAUkgIUIgiKdqIgEgDGohCCALIAI2AiggBSAGSSAHIAlJaiAKIARJaiAMIANJaiAIIAFJaiAIIB8oAgCtIiQgI34iIaciAmoiASACSSAhQiCIp2oiB2oiBiABIBUoAgCtIiMgIn4iIaciAmoiASACSSAhQiCIp2oiBWoiBCABIBQoAgCtIiIgJn4iIaciAmoiASACSSAhQiCIp2oiA2ohCCABIBMoAgCtICV+IiGnIgFqIgIgAUkgIUIgiKdqIgEgCGohCSALIAI2AiwgBCAFSSAGIAdJaiAIIANJaiAJIAFJaiAJICQgHSgCAK1+IiGnIgJqIgEgAkkgIUIgiKdqIgZqIgUgASAjIB4oAgCtIiN+IiGnIgJqIgEgAkkgIUIgiKdqIgRqIgMgASAiICAoAgCtIiR+IiGnIgFqIgIgAUkgIUIgiKdqIgFqIQcgCyACNgIwIAMgBEkgBSAGSWogByABSWogByAfKAIArSIiICN+IiGnIgJqIgEgAkkgIUIgiKdqIgVqIgQgASAVKAIArSAkfiIhpyICaiIBIAJJICFCIIinaiIDaiEGIAsgATYCNCALIAYgIiAkfiIhpyICaiIBNgI4IAsgBCAFSSAhQiCIp2ogBiADSWogASACSWo2AjwgACALECwgCyQEC8wFAgt/AX4gACABLQAeQQh0IAEtAB9yIAEtAB1BEHRyIAEtABxBGHRyNgIAIABBBGoiBiABLQAaQQh0IAEtABtyIAEtABlBEHRyIAEtABhBGHRyNgIAIABBCGoiByABLQAWQQh0IAEtABdyIAEtABVBEHRyIAEtABRBGHRyNgIAIABBDGoiCCABLQASQQh0IAEtABNyIAEtABFBEHRyIAEtABBBGHRyIgQ2AgAgAEEQaiIJIAEtAA5BCHQgAS0AD3IgAS0ADUEQdHIgAS0ADEEYdHIiAzYCACAAQRRqIgogAS0ACkEIdCABLQALciABLQAJQRB0ciABLQAIQRh0ciIFNgIAIABBGGoiCyABLQAGQQh0IAEtAAdyIAEtAAVBEHRyIAEtAARBGHRyIg02AgAgAEEcaiIMIAEtAAJBCHQgAS0AA3IgAS0AAUEQdHIgAS0AAEEYdHIiATYCACAAQQAgA0F+SSAFQX9HIAEgDXFBf0dyciIBQQFzIANBf0ZxIgNBAXMgBEHmubvVe0lxIAFyIgVBAXMgBEHmubvVe0txIANyIgRBAXMgBygCACIBQbvAovp6SXEgBXIiA0EBcyABQbvAovp6S3EgBHIiBUEBcyAGKAIAIgRBjL3J/ntJcSADckF/cyIDIARBjL3J/ntLcSAFciADIAAoAgAiBUHAgtmBfUtxciIDayIAQb/9pv4Cca0gBa18Ig4+AgAgBiAAQfPCtoEEca0gBK18IA5CIIh8Ig4+AgAgByAAQcS/3YUFca0gAa18IA5CIIh8Ig4+AgAgCCAAQZnGxKoEca0gCCgCAK18IA5CIIh8Ig4+AgAgCSADrSAJKAIArXwgDkIgiHwiDj4CACAKIA5CIIggCigCAK18Ig4+AgAgCyAOQiCIIAsoAgCtfCIOPgIAIAwgDkIgiCAMKAIArXw+AgAgAkUEQA8LIAIgAzYCAAuOBAEUfyAAQSRqIgwoAgAiBUEWdiIBQdEHbCAAKAIAaiECQQAgAUEGdCAAQQRqIg0oAgBqIAJBGnZqIgNBGnYgAEEIaiIOKAIAaiIBQRp2IABBDGoiDygCAGoiBkEadiAAQRBqIhAoAgBqIgdBGnYgAEEUaiIRKAIAaiIIQRp2IABBGGoiEigCAGoiBEEadiAAQRxqIhMoAgBqIglBGnYgAEEgaiIUKAIAaiILQRp2IAVB////AXFqIgVBFnYgA0H///8fcSIDQUBrIAJB////H3EiAkHRB2pBGnZqQf///x9LIAYgAXEgB3EgCHEgBEH///8fcSIEcSAJcSALcUH///8fRiAFQf///wFGcXFyIgprQdEHcSACaiECIApBBnQgA2ogAkEadmoiA0EadiABQf///x9xaiIKQRp2IAZB////H3FqIgZBGnYgB0H///8fcWoiB0EadiAIQf///x9xaiIIQRp2IARqIgRBGnYgCUH///8fcWoiCUEadiALQf///x9xaiEBIAAgAkH///8fcTYCACANIANB////H3E2AgAgDiAKQf///x9xNgIAIA8gBkH///8fcTYCACAQIAdB////H3E2AgAgESAIQf///x9xNgIAIBIgBEH///8fcTYCACATIAlB////H3E2AgAgFCABQf///x9xNgIAIAwgAUEadiAFakH///8BcTYCAAuhFwEnfyMEIQQjBEHAA2okBCACKAJQIQYgASgCeARAIAAgBjYCeCAAIAIpAgA3AgAgACACKQIINwIIIAAgAikCEDcCECAAIAIpAhg3AhggACACKQIgNwIgIABBKGoiAyACQShqIgEpAgA3AgAgAyABKQIINwIIIAMgASkCEDcCECADIAEpAhg3AhggAyABKQIgNwIgIABBATYCUCAAQdQAaiIAQgA3AgAgAEIANwIIIABCADcCECAAQgA3AhggAEEANgIgIAQkBA8LIAYEQCADBEAgA0EBNgIAIANBBGoiAkIANwIAIAJCADcCCCACQgA3AhAgAkIANwIYIAJBADYCIAsgACABKQIANwIAIAAgASkCCDcCCCAAIAEpAhA3AhAgACABKQIYNwIYIAAgASkCIDcCICAAIAEpAig3AiggACABKQIwNwIwIAAgASkCODcCOCAAQUBrIAFBQGspAgA3AgAgACABKQJINwJIIAAgASkCUDcCUCAAIAEpAlg3AlggACABKQJgNwJgIAAgASkCaDcCaCAAIAEpAnA3AnAgACABKAJ4NgJ4IAQkBA8LIARB+ABqIQwgBEHQAGohJCAEQShqIQogAEH4AGoiKUEANgIAIARBkANqIiUgAUHQAGoiJhAHIARB6AJqIgggASkCADcCACAIIAEpAgg3AgggCCABKQIQNwIQIAggASkCGDcCGCAIIAEpAiA3AiAgCEEkaiIdKAIAIhNBFnYiBkHRB2wgCCgCAGohGyAGQQZ0IAhBBGoiFygCAGogG0EadmoiGEEadiAIQQhqIhkoAgBqIhpBGnYgCEEMaiIFKAIAaiIHQRp2IAhBEGoiDSgCAGoiFEEadiAIQRRqIhUoAgBqIg5BGnYgCEEYaiIPKAIAaiIQQRp2IAhBHGoiESgCAGoiEkEadiAIQSBqIgYoAgBqIRwgCCAbQf///x9xIio2AgAgFyAYQf///x9xIgs2AgAgGSAaQf///x9xIh42AgAgBSAHQf///x9xIh82AgAgDSAUQf///x9xIiA2AgAgFSAOQf///x9xIiE2AgAgDyAQQf///x9xIiI2AgAgESASQf///x9xIiM2AgAgBiAcQf///x9xIhs2AgAgHSAcQRp2IBNB////AXFqIhw2AgAgBEHAAmoiFiACICUQCiAEQZgCaiIJIAFBKGoiBikCADcCACAJIAYpAgg3AgggCSAGKQIQNwIQIAkgBikCGDcCGCAJIAYpAiA3AiAgCUEkaiInKAIAIh1BFnYiBkHRB2wgCSgCAGohDSAGQQZ0IAlBBGoiEygCAGogDUEadmoiFEEadiAJQQhqIhcoAgBqIhVBGnYgCUEMaiIYKAIAaiIOQRp2IAlBEGoiGSgCAGoiD0EadiAJQRRqIhooAgBqIhBBGnYgCUEYaiIFKAIAaiIRQRp2IAlBHGoiBygCAGoiEkEadiAJQSBqIgYoAgBqISggCSANQf///x9xIg02AgAgEyAUQf///x9xIhQ2AgAgFyAVQf///x9xIhU2AgAgGCAOQf///x9xIg42AgAgGSAPQf///x9xIg82AgAgGiAQQf///x9xIhA2AgAgBSARQf///x9xIhE2AgAgByASQf///x9xIhI2AgAgBiAoQf///x9xIgY2AgAgJyAoQRp2IB1B////AXFqNgIAIARB8AFqIgcgAkEoaiAlEAogByAHICYQCiAEQcgBaiIFQbzh//8AICprIBYoAgBqNgIAIAVB/P3//wAgC2sgFigCBGo2AgQgBUH8////ACAeayAWKAIIajYCCCAFQfz///8AIB9rIBYoAgxqNgIMIAVB/P///wAgIGsgFigCEGo2AhAgBUH8////ACAhayAWKAIUajYCFCAFQfz///8AICJrIBYoAhhqNgIYIAVB/P///wAgI2sgFigCHGo2AhwgBUH8////ACAbayAWKAIgajYCICAFQfz//wcgHGsgFigCJGo2AiRB/P//ByAnKAIAayECIARBoAFqIgtBvOH//wAgDWsgBygCAGo2AgAgC0H8/f//ACAUayAHKAIEajYCBCALQfz///8AIBVrIAcoAghqNgIIIAtB/P///wAgDmsgBygCDGo2AgwgC0H8////ACAPayAHKAIQajYCECALQfz///8AIBBrIAcoAhRqNgIUIAtB/P///wAgEWsgBygCGGo2AhggC0H8////ACASayAHKAIcajYCHCALQfz///8AIAZrIAcoAiBqNgIgIAsgAiAHKAIkajYCJCAFEBdFBEAgDCALEAcgJCAFEAcgCiAFICQQCiADBEAgAyAFKQIANwIAIAMgBSkCCDcCCCADIAUpAhA3AhAgAyAFKQIYNwIYIAMgBSkCIDcCIAsgAEHQAGogJiAFEAogBCAIICQQCiAAIAQpAgA3AgAgACAEKQIINwIIIAAgBCkCEDcCECAAIAQpAhg3AhggACAEKQIgNwIgQfj7//8BIABBBGoiEygCAEEBdCAKQQRqIh4oAgBqayEOQfj///8BIABBCGoiFygCAEEBdCAKQQhqIh8oAgBqayEPQfj///8BIABBDGoiGCgCAEEBdCAKQQxqIiAoAgBqayEQQfj///8BIABBEGoiGSgCAEEBdCAKQRBqIiEoAgBqayERQfj///8BIABBFGoiGigCAEEBdCAKQRRqIiIoAgBqayESQfj///8BIABBGGoiBSgCAEEBdCAKQRhqIiMoAgBqayEGQfj///8BIABBHGoiBygCAEEBdCAKQRxqIhsoAgBqayEDQfj///8BIABBIGoiDSgCAEEBdCAKQSBqIhwoAgBqayECQfj//w8gAEEkaiIUKAIAQQF0IApBJGoiHSgCAGprIQEgAEH4wv//ASAAKAIAQQF0IAooAgBqayAMKAIAaiIVNgIAIBMgDiAMKAIEaiIONgIAIBcgDyAMKAIIaiIPNgIAIBggECAMKAIMaiIQNgIAIBkgESAMKAIQaiIRNgIAIBogEiAMKAIUaiISNgIAIAUgBiAMKAIYaiIGNgIAIAcgAyAMKAIcaiIDNgIAIA0gAiAMKAIgaiICNgIAIBQgASAMKAIkaiIBNgIAIABBKGoiE0G0pP//AiAVayAEKAIAajYCACAAQSxqIhdB9Pn//wIgDmsgBCgCBGo2AgAgAEEwaiIYQfT///8CIA9rIAQoAghqNgIAIABBNGoiGUH0////AiAQayAEKAIMajYCACAAQThqIhpB9P///wIgEWsgBCgCEGo2AgAgAEE8aiIFQfT///8CIBJrIAQoAhRqNgIAIABBQGsiB0H0////AiAGayAEKAIYajYCACAAQcQAaiINQfT///8CIANrIAQoAhxqNgIAIABByABqIhRB9P///wIgAmsgBCgCIGo2AgAgAEHMAGoiFUH0//8XIAFrIAQoAiRqNgIAIBMgEyALEAogCiAKIAkQCiAKQbzh//8AIAooAgBrIg42AgAgHkH8/f//ACAeKAIAayIPNgIAIB9B/P///wAgHygCAGsiEDYCACAgQfz///8AICAoAgBrIhE2AgAgIUH8////ACAhKAIAayISNgIAICJB/P///wAgIigCAGsiBjYCACAjQfz///8AICMoAgBrIgM2AgAgG0H8////ACAbKAIAayICNgIAIBxB/P///wAgHCgCAGsiATYCACAdQfz//wcgHSgCAGsiADYCACATIBMoAgAgDmo2AgAgFyAXKAIAIA9qNgIAIBggGCgCACAQajYCACAZIBkoAgAgEWo2AgAgGiAaKAIAIBJqNgIAIAUgBSgCACAGajYCACAHIAcoAgAgA2o2AgAgDSANKAIAIAJqNgIAIBQgFCgCACABajYCACAVIBUoAgAgAGo2AgAgBCQEDwsgCxAXBEAgACABIAMQGiAEJAQPCyADBEAgA0IANwIAIANCADcCCCADQgA3AhAgA0IANwIYIANCADcCIAsgKUEBNgIAIAQkBAuvAwEBfyAAIAFBHGoiAigCAEEYdjoAACAAIAIoAgBBEHY6AAEgACACKAIAQQh2OgACIAAgAigCADoAAyAAIAFBGGoiAigCAEEYdjoABCAAIAIoAgBBEHY6AAUgACACKAIAQQh2OgAGIAAgAigCADoAByAAIAFBFGoiAigCAEEYdjoACCAAIAIoAgBBEHY6AAkgACACKAIAQQh2OgAKIAAgAigCADoACyAAIAFBEGoiAigCAEEYdjoADCAAIAIoAgBBEHY6AA0gACACKAIAQQh2OgAOIAAgAigCADoADyAAIAFBDGoiAigCAEEYdjoAECAAIAIoAgBBEHY6ABEgACACKAIAQQh2OgASIAAgAigCADoAEyAAIAFBCGoiAigCAEEYdjoA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BxAHIAcgBxAHIAcgBxAHIAcgBxAHIAcgBxAHIAcgByAGEAogBEHIAWoiBSAHKQIANwIAIAUgBykCCDcCCCAFIAcpAhA3AhAgBSAHKQIYNwIYIAUgBykCIDcCICAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUgBxAKIARBoAFqIgIgBSkCADcCACACIAUpAgg3AgggAiAFKQIQNwIQIAIgBSkCGDcCGCACIAUpAiA3AiAgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACIAUQCiAEQfgAaiIJIAIpAgA3AgAgCSACKQIINwIIIAkgAikCEDcCECAJIAIpAhg3AhggCSACKQIgNwIgQQAhBgNAIAkgCRAHIAZBAWoiBkHYAEcNAAsgCSAJIAIQCiADIAkpAgA3AgAgAyAJKQIINwIIIAMgCSkCEDcCECADIAkpAhg3AhggAyAJKQIgNwIgIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAyAFEAogCCADKQIANwIAIAggAykCCDcCCCAIIAMpAhA3AhAgCCADKQIYNwIYIAggAykCIDcCICAIIAgQByAIIAgQByAIIAgQByAIIAggChAKIAQgCCkCADcCACAEIAgpAgg3AgggBCAIKQIQNwIQIAQgCCkCGDcCGCAEIAgpAiA3AiAgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEIAcQCiAEIAQQByAEIAQQByAEIAQQByAEIAQQByAEIAQQByAEIAQgARAKIAQgBBAHIAQgBBAHIAQgBBAHIAQgBCALEAogBCAEEAcgBCAEEAcgACABIAQQCiAEJAQL7gQBG38gAEEkaiILKAIAIgJBFnYiAUHRB2wgACgCAGohBCABQQZ0IABBBGoiDCgCAGogBEEadmoiBUEadiAAQQhqIg0oAgBqIgZB////H3EhByAGQRp2IABBDGoiDigCAGoiCEEadiAAQRBqIg8oAgBqIQEgCEH///8fcSEJIAFB////H3EhCiABQRp2IABBFGoiECgCAGoiEUEadiAAQRhqIhIoAgBqIRMgEUH///8fcSEUIBNBGnYgAEEcaiIVKAIAaiIWQRp2IABBIGoiFygCAGohAyAWQf///x9xIRggA0H///8fcSEZIANBGnYgAkH///8BcWoiAkEWdiAFQf///x9xIgVBQGsgBEH///8fcSIEQdEHaiIaQRp2IhtqQf///x9LIAggBnEgAXEgEXEgE0H///8fcSIBcSAWcSADcUH///8fRiACQf///wFGcXFyIgNFBEAgACAENgIAIAwgBTYCACANIAc2AgAgDiAJNgIAIA8gCjYCACAQIBQ2AgAgEiABNgIAIBUgGDYCACAXIBk2AgAgCyACNgIADwsgGyAFaiADQQZ0aiIDQRp2IAdqIgRBGnYgCWoiBkEadiAKaiIHQRp2IBRqIghBGnYgAWoiAUEadiAYaiIJQRp2IBlqIgpBGnYgAmpB////AXEhAiAAIBpB////H3E2AgAgDCADQf///x9xNgIAIA0gBEH///8fcTYCACAOIAZB////H3E2AgAgDyAHQf///x9xNgIAIBAgCEH///8fcTYCACASIAFB////H3E2AgAgFSAJQf///x9xNgIAIBcgCkH///8fcTYCACALIAI2AgALsAIBCn8gACgCJCIBQRZ2IgJB0QdsIAAoAgBqIgNB////H3EiBEHQB3MhBSAEQQBHIAVB////H0dxBEBBAA8LIANBGnYgAkEGdHIgACgCBGoiAkEadiAAKAIIaiIDQRp2IAAoAgxqIgZBGnYgACgCEGoiB0EadiAAKAIUaiIIQRp2IAAoAhhqIglBGnYgACgCHGoiCkEadiAAKAIgaiIAQRp2IAFB////AXFqIQEgAkHAAHMgBXEgA3EgBnEgB3EgCHEgCXEgCnEgAHEgAUGAgIAec3FB////H0YEf0EBBSACQf///x9xIARyIANB////H3FyIAZB////H3FyIAdB////H3FyIAhB////H3FyIAlB////H3FyIApB////H3FyIABB////H3FyIAFyRQtBAXELmAIBBH8gACACaiEEIAFB/wFxIQEgAkHDAE4EQANAIABBA3EEQCAAIAE6AAAgAEEBaiEADAELCyAEQXxxIgVBQGohBiABIAFBCHRyIAFBEHRyIAFBGHRyIQMDQCAAIAZMBEAgACADNgIAIAAgAzYCBCAAIAM2AgggACADNgIMIAAgAzYCECAAIAM2AhQgACADNgIYIAAgAzYCHCAAIAM2AiAgACADNgIkIAAgAzYCKCAAIAM2AiwgACADNgIwIAAgAzYCNCAAIAM2AjggACADNgI8IABBQGshAAwBCwsDQCAAIAVIBEAgACADNgIAIABBBGohAAwBCwsLA0AgACAESARAIAAgAToAACAAQQFqIQAMAQsLIAQgAmsLqy8BnwF/IwQhDSMEQbAmaiQEIA1BgCZqIQ4gDUHYJWohESANQdgkaiEGIA1BhCRqIRIgDUGwI2ohDCANQcgfaiEWIA1ByBdqIUkgDUHoD2ohBSANQagNaiEJIA1BiAhqIQsCfwJAIAMoAgQgAygCAHIgAygCCHIgAygCDHIgAygCEHIgAygCFHIgAygCGHIgAygCHHJFDQAgAigCeA0AIA1BhAhqIgpBADYCACANQYAIaiANIANBBRArIgM2AgAgBiACIAooAgAiD0H8AGxqIhBBABAaIAwgBikCADcCACAMIAYpAgg3AgggDCAGKQIQNwIQIAwgBikCGDcCGCAMIAYpAiA3AiAgDEEoaiIKIAZBKGoiCCkCADcCACAKIAgpAgg3AgggCiAIKQIQNwIQIAogCCkCGDcCGCAKIAgpAiA3AiAgDEEANgJQIA4gBkHQAGoiChAHIBEgDiAKEAogEiAQIA4QCiASQShqIgggAiAPQfwAbGpBKGogERAKIBIgAiAPQfwAbGooAng2AlAgBSASKQIANwIAIAUgEikCCDcCCCAFIBIpAhA3AhAgBSASKQIYNwIYIAUgEikCIDcCICAFQShqIhAgCCkCADcCACAQIAgpAgg3AgggECAIKQIQNwIQIBAgCCkCGDcCGCAQIAgpAiA3AiAgBUHQAGoiCCACIA9B/ABsakHQAGoiAikCADcCACAIIAIpAgg3AgggCCACKQIQNwIQIAggAikCGDcCGCAIIAIpAiA3AiAgBUH4AGoiE0EANgIAIAkgCikCADcCACAJIAopAgg3AgggCSAKKQIQNwIQIAkgCikCGDcCGCAJIAopAiA3AiAgBUH8AGoiAiAFIAwgCUEoaiIUEBAgBUH4AWoiCCACIAwgCUHQAGoiBxAQIAVB9AJqIgIgCCAMIAlB+ABqIh0QECAFQfADaiIIIAIgDCAJQaABaiIeEBAgBUHsBGoiAiAIIAwgCUHIAWoiHxAQIAVB6AVqIg8gAiAMIAlB8AFqIiEQECAFQeQGaiIIIA8gDCAJQZgCaiIPEBAgBUG0B2oiAiACIAoQCiALQcwEaiIJIAgpAgA3AgAgCSAIKQIINwIIIAkgCCkCEDcCECAJIAgpAhg3AhggCSAIKQIgNwIgIAtB9ARqIgkgBUGMB2oiCikCADcCACAJIAopAgg3AgggCSAKKQIQNwIQIAkgCikCGDcCGCAJIAopAiA3AiAgC0GYBWoiIigCACIjQRZ2IghB0QdsIAkoAgBqIQogCEEGdCALQfgEaiIkKAIAaiAKQRp2aiIlQRp2IAtB/ARqIiYoAgBqIidBGnYgC0GABWoiKCgCAGoiKUEadiALQYQFaiIqKAIAaiIrQRp2IAtBiAVqIiwoAgBqIi1BGnYgC0GMBWoiLigCAGoiL0EadiALQZAFaiIwKAIAaiIxQRp2IAtBlAVqIjIoAgBqIQggCSAKQf///x9xNgIAICQgJUH///8fcTYCACAmICdB////H3E2AgAgKCApQf///x9xNgIAICogK0H///8fcTYCACAsIC1B////H3E2AgAgLiAvQf///x9xNgIAIDAgMUH///8fcTYCACAyIAhB////H3E2AgAgIiAIQRp2ICNB////AXFqNgIAIBYgAikCADcCACAWIAIpAgg3AgggFiACKQIQNwIQIBYgAikCGDcCGCAWIAIpAiA3AiAgC0EANgKcBSAGIA8pAgA3AgAgBiAPKQIINwIIIAYgDykCEDcCECAGIA8pAhg3AhggBiAPKQIgNwIgIA4gBhAHIBEgDiAGEAogC0H4A2ogBUHoBWogDhAKIAtBoARqIAVBkAZqIBEQCiALIAUoAuAGNgLIBCAGIAYgIRAKIA4gBhAHIBEgDiAGEAogC0GkA2ogBUHsBGogDhAKIAtBzANqIAVBlAVqIBEQCiALIAUoAuQFNgL0AyAGIAYgHxAKIA4gBhAHIBEgDiAGEAogC0HQAmogBUHwA2ogDhAKIAtB+AJqIAVBmARqIBEQCiALIAUoAugENgKgAyAGIAYgHhAKIA4gBhAHIBEgDiAGEAogC0H8AWogBUH0AmogDhAKIAtBpAJqIAVBnANqIBEQCiALIAUoAuwDNgLMAiAGIAYgHRAKIA4gBhAHIBEgDiAGEAogC0GoAWogBUH4AWogDhAKIAtB0AFqIAVBoAJqIBEQCiALIAUoAvACNgL4ASAGIAYgBxAKIA4gBhAHIBEgDiAGEAogC0HUAGogBUH8AGogDhAKIAtB/ABqIAVBpAFqIBEQCiALIAUoAvQBNgKkASAGIAYgFBAKIA4gBhAHIBEgDiAGEAogCyAFIA4QCiALQShqIBAgERAKIAsgEygCADYCUEEBIUogA0EASgR/IAMFQQALDAELIBZBATYCACAWQQRqIgJCADcCACACQgA3AgggAkIANwIQIAJCADcCGCACQQA2AiBBASFLQQALIQIgBARAIEkgBEEPECsiAyFMIAMgAkoEQCADIQILCyABQfgAaiIdQQE2AgAgAUIANwIAIAFCADcCCCABQgA3AhAgAUIANwIYIAFCADcCICABQgA3AiggAUIANwIwIAFCADcCOCABQUBrQgA3AgAgAUIANwJIIAFCADcCUCABQgA3AlggAUIANwJgIAFCADcCaCABQgA3AnAgAkEATARAIA0kBA8LIA1B6CFqISsgDUHwIGohLCANQcggaiFNIA1B8B9qIgVB0ABqIWogAUHQAGohHiAGQQRqIU4gBkEIaiFPIAZBDGohUCAGQRBqIVEgBkEUaiFSIAZBGGohUyAGQRxqIVQgBkEgaiFVIAZBJGohViABQShqIRMgDEEEaiFXIAxBCGohWCAMQQxqIVkgDEEQaiFaIAxBFGohWyAMQRhqIVwgDEEcaiFdIAxBIGohXiAMQSRqIV8gBUEoaiFgIA1B4CJqIghBBGohayAIQQhqIWwgCEEMaiFtIAhBEGohbiAIQRRqIW8gCEEYaiFwIAhBHGohcSAIQSBqIXIgCEEkaiFzIBJBBGohdCASQQhqIXUgEkEMaiF2IBJBEGohdyASQRRqIXggEkEYaiF5IBJBHGoheiASQSBqIXsgEkEkaiF8IA1BuCJqIhBBBGohfSAQQQhqIX4gEEEMaiF/IBBBEGohgAEgEEEUaiGBASAQQRhqIYIBIBBBHGohgwEgEEEgaiGEASAQQSRqIYUBIA1BiCNqIg9BBGohhgEgD0EIaiGHASAPQQxqIYgBIA9BEGohiQEgD0EUaiGKASAPQRhqIYsBIA9BHGohjAEgD0EgaiGNASAPQSRqIY4BIAFBBGohYSABQQhqIWIgAUEMaiFjIAFBEGohZCABQRRqIWUgAUEYaiFmIAFBHGohZyABQSBqIWggAUEkaiFpIA1BwCFqIgpBBGohLSAKQQhqIS4gCkEMaiEvIApBEGohMCAKQRRqITEgCkEYaiEyIApBHGohOSAKQSBqITogCkEkaiE7IA1BkCJqIhRBBGohjwEgFEEIaiGQASAUQQxqIZEBIBRBEGohkgEgFEEUaiGTASAUQRhqIZQBIBRBHGohlQEgFEEgaiGWASAUQSRqIZcBIAFBLGohPCABQTBqIT0gAUE0aiE+IAFBOGohPyABQTxqIUAgAUFAayFBIAFBxABqIUIgAUHIAGohQyABQcwAaiFEIA1BmCFqIglBBGohmAEgCUEIaiGZASAJQQxqIZoBIAlBEGohmwEgCUEUaiGcASAJQRhqIZ0BIAlBHGohngEgCUEgaiGfASAJQSRqIaABIAFB0ABqIaEBIAFB1ABqIR8gBUEoaiEhIAVBLGohIiAFQTBqISMgBUE0aiEkIAVBOGohJSAFQTxqISYgBUFAayEnIAVBxABqISggBUHIAGohKSAFQcwAaiEqIA1BgAhqKAIAIaIBA0AgAkF/aiEEIAEgAUEAEBogSyACIKIBSnJFBEBBACEDA0AgDSADQYgIbGogBEECdGooAgAiBwRAIAsgA0EDdEHUAGxqIRUgB0EASgRAIAUgFSAHQX9qQQJtQdQAbGoiBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAHKQIoNwIoIAUgBykCMDcCMCAFIAcpAjg3AjggBUFAayAHQUBrKQIANwIAIAUgBykCSDcCSCAFIAcoAlA2AlAFIAUgFSAHQX9zQQJtQdQAbGoiBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAHKQIoNwIoIAUgBykCMDcCMCAFIAcpAjg3AjggBUFAayAHQUBrKQIANwIAIAUgBykCSDcCSCAFIAcoAlA2AlAgIUG84f//ACAhKAIAazYCACAiQfz9//8AICIoAgBrNgIAICNB/P///wAgIygCAGs2AgAgJEH8////ACAkKAIAazYCACAlQfz///8AICUoAgBrNgIAICZB/P///wAgJigCAGs2AgAgJ0H8////ACAnKAIAazYCACAoQfz///8AICgoAgBrNgIAIClB/P///wAgKSgCAGs2AgAgKkH8//8HICooAgBrNgIACyABIAEgBUEAEBALIANBAWoiAyBKRw0ACwsgAiBMTARAIEkgBEECdGooAgAiAwRAIAAoAgAhByADQQBKBEAgBSAHIANBf2pBAm1BBnRqECMFIAUgByADQX9zQQJtQQZ0ahAjICFBvOH//wAgISgCAGs2AgAgIkH8/f//ACAiKAIAazYCACAjQfz///8AICMoAgBrNgIAICRB/P///wAgJCgCAGs2AgAgJUH8////ACAlKAIAazYCACAmQfz///8AICYoAgBrNgIAICdB/P///wAgJygCAGs2AgAgKEH8////ACAoKAIAazYCACApQfz///8AICkoAgBrNgIAICpB/P//ByAqKAIAazYCAAsCQCBqKAIARQRAIB0oAgAEQCAdQQA2AgAgLCAWEAcgTSAsIBYQCiABIAUgLBAKIBMgYCBNEAogoQFBATYCACAfQgA3AgAgH0IANwIIIB9CADcCECAfQgA3AhggH0EANgIgDAILIB1BADYCACAOIB4gFhAKIBEgDhAHIAYgASkCADcCACAGIAEpAgg3AgggBiABKQIQNwIQIAYgASkCGDcCGCAGIAEpAiA3AiAgVigCACIVQRZ2IgdB0QdsIAYoAgBqIQMgB0EGdCBOKAIAaiADQRp2aiIXQRp2IE8oAgBqIhhBGnYgUCgCAGoiGUEadiBRKAIAaiIaQRp2IFIoAgBqIhtBGnYgUygCAGoiHEEadiBUKAIAaiIgQRp2IFUoAgBqIQcgBiADQf///x9xIkU2AgAgTiAXQf///x9xIhc2AgAgTyAYQf///x9xIhg2AgAgUCAZQf///x9xIhk2AgAgUSAaQf///x9xIho2AgAgUiAbQf///x9xIhs2AgAgUyAcQf///x9xIhw2AgAgVCAgQf///x9xIiA2AgAgVSAHQf///x9xIkY2AgAgViAHQRp2IBVB////AXFqIhU2AgAgEiAFIBEQCiAMIBMpAgA3AgAgDCATKQIINwIIIAwgEykCEDcCECAMIBMpAhg3AhggDCATKQIgNwIgIF8oAgAiR0EWdiIHQdEHbCAMKAIAaiEDIAdBBnQgVygCAGogA0EadmoiM0EadiBYKAIAaiI0QRp2IFkoAgBqIjVBGnYgWigCAGoiNkEadiBbKAIAaiI3QRp2IFwoAgBqIjhBGnYgXSgCAGoiSEEadiBeKAIAaiEHIAwgA0H///8fcSIDNgIAIFcgM0H///8fcSIzNgIAIFggNEH///8fcSI0NgIAIFkgNUH///8fcSI1NgIAIFogNkH///8fcSI2NgIAIFsgN0H///8fcSI3NgIAIFwgOEH///8fcSI4NgIAIF0gSEH///8fcSJINgIAIF4gB0H///8fcSKjATYCACBfIAdBGnYgR0H///8BcWoiBzYCACAPIGAgERAKIA8gDyAOEAogCEG84f//ACBFayASKAIAajYCACBrQfz9//8AIBdrIHQoAgBqNgIAIGxB/P///wAgGGsgdSgCAGo2AgAgbUH8////ACAZayB2KAIAajYCACBuQfz///8AIBprIHcoAgBqNgIAIG9B/P///wAgG2sgeCgCAGo2AgAgcEH8////ACAcayB5KAIAajYCACBxQfz///8AICBrIHooAgBqNgIAIHJB/P///wAgRmsgeygCAGo2AgAgc0H8//8HIBVrIHwoAgBqNgIAIBBBvOH//wAgA2sgDygCAGo2AgAgfUH8/f//ACAzayCGASgCAGo2AgAgfkH8////ACA0ayCHASgCAGo2AgAgf0H8////ACA1ayCIASgCAGo2AgAggAFB/P///wAgNmsgiQEoAgBqNgIAIIEBQfz///8AIDdrIIoBKAIAajYCACCCAUH8////ACA4ayCLASgCAGo2AgAggwFB/P///wAgSGsgjAEoAgBqNgIAIIQBQfz///8AIKMBayCNASgCAGo2AgAghQFB/P//ByAHayCOASgCAGo2AgAgCBAXRQRAIBQgEBAHICsgCBAHIAogCCArEAogHiAeIAgQCiAJIAYgKxAKIAEgCSkCADcCACABIAkpAgg3AgggASAJKQIQNwIQIAEgCSkCGDcCGCABIAkpAiA3AiAgLSgCACEDIC4oAgAhByAvKAIAIRUgMCgCACEXIDEoAgAhGCAyKAIAIRkgOSgCACEaIDooAgAhGyA7KAIAIRwgYSgCAEF+bCEgIGIoAgBBfmwhRSBjKAIAQX5sIUYgZCgCAEF+bCFHIGUoAgBBfmwhMyBmKAIAQX5sITQgZygCAEF+bCE1IGgoAgBBfmwhNiBpKAIAQX5sITcgASABKAIAQX5sQfjC//8BaiAKKAIAayAUKAIAaiI4NgIAIGEgIEH4+///AWogA2sgjwEoAgBqIgM2AgAgYiBFQfj///8BaiAHayCQASgCAGoiBzYCACBjIEZB+P///wFqIBVrIJEBKAIAaiIVNgIAIGQgR0H4////AWogF2sgkgEoAgBqIhc2AgAgZSAzQfj///8BaiAYayCTASgCAGoiGDYCACBmIDRB+P///wFqIBlrIJQBKAIAaiIZNgIAIGcgNUH4////AWogGmsglQEoAgBqIho2AgAgaCA2Qfj///8BaiAbayCWASgCAGoiGzYCACBpIDdB+P//D2ogHGsglwEoAgBqIhw2AgAgE0G0pP//AiA4ayAJKAIAajYCACA8QfT5//8CIANrIJgBKAIAajYCACA9QfT///8CIAdrIJkBKAIAajYCACA+QfT///8CIBVrIJoBKAIAajYCACA/QfT///8CIBdrIJsBKAIAajYCACBAQfT///8CIBhrIJwBKAIAajYCACBBQfT///8CIBlrIJ0BKAIAajYCACBCQfT///8CIBprIJ4BKAIAajYCACBDQfT///8CIBtrIJ8BKAIAajYCACBEQfT//xcgHGsgoAEoAgBqNgIAIBMgEyAQEAogCiAKIAwQCiAKQbzh//8AIAooAgBrIgM2AgAgLUH8/f//ACAtKAIAayIHNgIAIC5B/P///wAgLigCAGsiFTYCACAvQfz///8AIC8oAgBrIhc2AgAgMEH8////ACAwKAIAayIYNgIAIDFB/P///wAgMSgCAGsiGTYCACAyQfz///8AIDIoAgBrIho2AgAgOUH8////ACA5KAIAayIbNgIAIDpB/P///wAgOigCAGsiHDYCACA7Qfz//wcgOygCAGsiIDYCACATIBMoAgAgA2o2AgAgPCA8KAIAIAdqNgIAID0gPSgCACAVajYCACA+ID4oAgAgF2o2AgAgPyA/KAIAIBhqNgIAIEAgQCgCACAZajYCACBBIEEoAgAgGmo2AgAgQiBCKAIAIBtqNgIAIEMgQygCACAcajYCACBEIEQoAgAgIGo2AgAMAgsgEBAXBEAgASABQQAQGgUgHUEBNgIACwsLCwsgAkEBSgRAIAQhAgwBCwsgHSgCAARAIA0kBA8LIB4gHiAWEAogDSQEC84SATB/IwQhBCMEQaABaiQEIARB+ABqIQUgBEHQAGohByAEQShqIQMgACABKAJ4IgY2AnggAkEARyEIIAYEQCAIRQRAIAQkBA8LIAJBATYCACACQQRqIgBCADcCACAAQgA3AgggAEIANwIQIABCADcCGCAAQQA2AiAgBCQEBSABQShqIQYgCARAIAIgBikCADcCACACIAYpAgg3AgggAiAGKQIQNwIQIAIgBikCGDcCGCACIAYpAiA3AiAgAkEkaiIKKAIAIgtBFnYiCUHRB2wgAigCAGohCCAJQQZ0IAJBBGoiDCgCAGogCEEadmoiDUEadiACQQhqIg4oAgBqIhJBGnYgAkEMaiITKAIAaiIUQRp2IAJBEGoiFSgCAGoiFkEadiACQRRqIhcoAgBqIhhBGnYgAkEYaiIZKAIAaiIaQRp2IAJBHGoiDygCAGoiEEEadiACQSBqIhEoAgBqIQkgAiAIQQF0Qf7//z9xNgIAIAwgDUEBdEH+//8/cTYCACAOIBJBAXRB/v//P3E2AgAgEyAUQQF0Qf7//z9xNgIAIBUgFkEBdEH+//8/cTYCACAXIBhBAXRB/v//P3E2AgAgGSAaQQF0Qf7//z9xNgIAIA8gEEEBdEH+//8/cTYCACARIAlBAXRB/v//P3E2AgAgCiAJQRp2IAtB////AXFqQQF0NgIACyAAQdAAaiICIAFB0ABqIAYQCiACIAIoAgBBAXQ2AgAgAEHUAGoiAiACKAIAQQF0NgIAIABB2ABqIgIgAigCAEEBdDYCACAAQdwAaiICIAIoAgBBAXQ2AgAgAEHgAGoiAiACKAIAQQF0NgIAIABB5ABqIgIgAigCAEEBdDYCACAAQegAaiICIAIoAgBBAXQ2AgAgAEHsAGoiAiACKAIAQQF0NgIAIABB8ABqIgIgAigCAEEBdDYCACAAQfQAaiICIAIoAgBBAXQ2AgAgBSABEAcgBSAFKAIAQQNsNgIAIAVBBGoiAiACKAIAQQNsNgIAIAVBCGoiAiACKAIAQQNsNgIAIAVBDGoiAiACKAIAQQNsNgIAIAVBEGoiAiACKAIAQQNsNgIAIAVBFGoiAiACKAIAQQNsNgIAIAVBGGoiAiACKAIAQQNsNgIAIAVBHGoiAiACKAIAQQNsNgIAIAVBIGoiAiACKAIAQQNsNgIAIAVBJGoiAiACKAIAQQNsNgIAIAcgBRAHIAMgBhAHIAMgAygCAEEBdDYCACADQQRqIgIgAigCAEEBdDYCACADQQhqIgYgBigCAEEBdDYCACADQQxqIgggCCgCAEEBdDYCACADQRBqIgkgCSgCAEEBdDYCACADQRRqIgogCigCAEEBdDYCACADQRhqIgsgCygCAEEBdDYCACADQRxqIgwgDCgCAEEBdDYCACADQSBqIg0gDSgCAEEBdDYCACADQSRqIg4gDigCAEEBdDYCACAEIAMQByAEIAQoAgBBAXQ2AgAgBEEEaiISIBIoAgBBAXQ2AgAgBEEIaiITIBMoAgBBAXQ2AgAgBEEMaiIUIBQoAgBBAXQ2AgAgBEEQaiIVIBUoAgBBAXQ2AgAgBEEUaiIWIBYoAgBBAXQ2AgAgBEEYaiIXIBcoAgBBAXQ2AgAgBEEcaiIYIBgoAgBBAXQ2AgAgBEEgaiIZIBkoAgBBAXQ2AgAgBEEkaiIaIBooAgBBAXQ2AgAgAyADIAEQCiAAIAMpAgA3AgAgACADKQIINwIIIAAgAykCEDcCECAAIAMpAhg3AhggACADKQIgNwIgQfb6/78CIABBBGoiASgCAEECdGshD0H2//+/AiAAQQhqIhAoAgBBAnRrIRFB9v//vwIgAEEMaiIbKAIAQQJ0ayEcQfb//78CIABBEGoiHSgCAEECdGshHkH2//+/AiAAQRRqIh8oAgBBAnRrISBB9v//vwIgAEEYaiIhKAIAQQJ0ayEiQfb//78CIABBHGoiIygCAEECdGshJEH2//+/AiAAQSBqIiUoAgBBAnRrISZB9v//EyAAQSRqIicoAgBBAnRrISggAEHWs/+/AiAAKAIAQQJ0ayAHKAIAIilqNgIAIAEgDyAHQQRqIg8oAgAiAWo2AgAgECARIAdBCGoiECgCACIRajYCACAbIBwgB0EMaiIbKAIAIhxqNgIAIB0gHiAHQRBqIh0oAgAiHmo2AgAgHyAgIAdBFGoiHygCACIgajYCACAhICIgB0EYaiIhKAIAIiJqNgIAICMgJCAHQRxqIiMoAgAiJGo2AgAgJSAmIAdBIGoiJSgCACImajYCACAnICggB0EkaiInKAIAIihqNgIAIAIoAgBBBmwhKiAGKAIAQQZsISsgCCgCAEEGbCEsIAkoAgBBBmwhLSAKKAIAQQZsIS4gCygCAEEGbCEvIAwoAgBBBmwhMCANKAIAQQZsITEgDigCAEEGbCEyIAMgAygCAEEGbEG84f//ACApa2o2AgAgAiAqQfz9//8AIAFrajYCACAGICtB/P///wAgEWtqNgIAIAggLEH8////ACAca2o2AgAgCSAtQfz///8AIB5rajYCACAKIC5B/P///wAgIGtqNgIAIAsgL0H8////ACAia2o2AgAgDCAwQfz///8AICRrajYCACANIDFB/P///wAgJmtqNgIAIA4gMkH8//8HIChrajYCACAAQShqIgEgBSADEAogB0Ga0v+/ASAEKAIAayICNgIAIA9B+vz/vwEgEigCAGsiAzYCACAQQfr//78BIBMoAgBrIgU2AgAgG0H6//+/ASAUKAIAayIHNgIAIB1B+v//vwEgFSgCAGsiBjYCACAfQfr//78BIBYoAgBrIgg2AgAgIUH6//+/ASAXKAIAayIJNgIAICNB+v//vwEgGCgCAGsiCjYCACAlQfr//78BIBkoAgBrIgs2AgAgJ0H6//8LIBooAgBrIgw2AgAgASABKAIAIAJqNgIAIABBLGoiASABKAIAIANqNgIAIABBMGoiASABKAIAIAVqNgIAIABBNGoiASABKAIAIAdqNgIAIABBOGoiASABKAIAIAZqNgIAIABBPGoiASABKAIAIAhqNgIAIABBQGsiASABKAIAIAlqNgIAIABBxABqIgEgASgCACAKajYCACAAQcgAaiIBIAEoAgAgC2o2AgAgAEHMAGoiACAAKAIAIAxqNgIAIAQkBAsLiAQBFH8jBCECIwRB0ABqJAQgAkEoaiIDIAEpAgA3AgAgAyABKQIINwIIIAMgASkCEDcCECADIAEpAhg3AhggAyABKQIgNwIgIAMQDyACIAFBKGoiASkCADcCACACIAEpAgg3AgggAiABKQIQNwIQIAIgASkCGDcCGCACIAEpAiA3AiAgAhAPIAMoAgghASADKAIMIQQgAygCFEECdCADKAIQIglBGHZyIAMoAhgiCkEcdHIhCyADKAIcIQUgAygCJEEKdCADKAIgIgxBEHZyIQ0gAigCBCIOQRp0IAIoAgByIQ8gAigCCCEGIAIoAgwhByACKAIUQQJ0IAIoAhAiEEEYdnIgAigCGCIRQRx0ciESIAIoAhwhCCACKAIkQQp0IAIoAiAiE0EQdnIhFCAAIAMoAgQiFUEadCADKAIAcjYAACAAIAFBFHQgFUEGdnI2AAQgACAEQQ50IAFBDHZyNgAIIAAgCUEIdCAEQRJ2cjYADCAAIAs2ABAgACAFQRZ0IApBBHZyNgAUIAAgDEEQdCAFQQp2cjYAGCAAIA02ABwgACAPNgAgIAAgBkEUdCAOQQZ2cjYAJCAAIAdBDnQgBkEMdnI2ACggACAQQQh0IAdBEnZyNgAsIAAgEjYAMCAAIAhBFnQgEUEEdnI2ADQgACATQRB0IAhBCnZyNgA4IAAgFDYAPCACJAQL5gQCCn8DfiAAIAIoAgCtIAEoAgCtfCINPgIAIABBBGoiBSANQiCIIAEoAgStfCACKAIErXwiDT4CACAAQQhqIgYgAigCCK0gASgCCK18IA1CIIh8Ig2nIgM2AgAgAEEMaiIHIAIoAgytIAEoAgytfCANQiCIfCINpyIENgIAIABBEGoiCCACKAIQrSABKAIQrXwgDUIgiHwiDaciCTYCACAAQRRqIgogAigCFK0gASgCFK18IA1CIIh8Ig0+AgAgAEEYaiILIAIoAhitIAEoAhitfCANQiCIfCIOPgIAIABBHGoiDCACKAIcrSABKAIcrXwgDkIgiHwiDz4CACAAIA9CIIggCUF+SSANIA4gD4ODp0F/R3IiAUEBcyAJQX9GcSICQQFzIARB5rm71XtJcSABciIBQQFzIARB5rm71XtLcSACciICQQFzIANBu8Ci+npJcSABciIEQQFzIANBu8Ci+npLcSACciICQQFzIAUoAgAiAUGMvcn+e0lxIARyQX9zIgMgAUGMvcn+e0txIAJyIAMgACgCACICQcCC2YF9S3FyrXwiDaciAEG//ab+AmytIAKtfCIOPgIAIAUgAEHzwraBBGytIAGtfCAOQiCIfCIOPgIAIAYgAEHEv92FBWytIAYoAgCtfCAOQiCIfCIOPgIAIAcgAEGZxsSqBGytIAcoAgCtfCAOQiCIfCIOPgIAIAggDUL/////D4MgCCgCAK18IA5CIIh8Ig0+AgAgCiANQiCIIAooAgCtfCINPgIAIAsgDUIgiCALKAIArXwiDT4CACAMIA1CIIggDCgCAK18PgIAC5wEAQJ/IAAgAUEkaiIDKAIAQQ52OgAAIAAgAygCAEEGdjoAASAAIAFBIGoiAigCAEEYdkEDcSADKAIAQQJ0cjoAAiAAIAIoAgBBEHY6AAMgACACKAIAQQh2OgAEIAAgAigCADoABSAAIAFBHGoiAigCAEESdjoABiAAIAIoAgBBCnY6AAcgACACKAIAQQJ2OgAIIAAgAUEYaiIDKAIAQRR2QT9xIAIoAgBBBnRyOgAJIAAgAygCAEEMdjoACiAAIAMoAgBBBHY6AAsgACABQRRqIgIoAgBBFnZBD3EgAygCAEEEdHI6AAwgACACKAIAQQ52OgANIAAgAigCAEEGdjoADiAAIAFBEGoiAygCAEEYdkEDcSACKAIAQQJ0cjoADyAAIAMoAgBBEHY6ABAgACADKAIAQQh2OgARIAAgAygCADoAEiAAIAFBDGoiAigCAEESdjoAEyAAIAIoAgBBCnY6ABQgACACKAIAQQJ2OgAVIAAgAUEIaiIDKAIAQRR2QT9xIAIoAgBBBnRyOgAWIAAgAygCAEEMdjoAFyAAIAMoAgBBBHY6ABggACABQQRqIgIoAgBBFnZBD3EgAygCAEEEdHI6ABkgACACKAIAQQ52OgAaIAAgAigCAEEGdjoAGyAAIAEoAgBBGHZBA3EgAigCAEECdHI6ABwgACABKAIAQRB2OgAdIAAgASgCAEEIdjoAHiAAIAEoAgA6AB8LlAoBK38jBCEKIwRBgAFqJAQgASAAQSRqIgYpAgA3AgAgASAGKQIINwIIIAEgBikCEDcCECABIAYpAhg3AhggASAGKQIgNwIgIAEgBikCKDcCKCABIAYpAjA3AjAgASAGKQI4NwI4IAFBQGsgBkFAaykCADcCACABIAYpAkg3AkggASAGKQJQNwJQIAEgBikCWDcCWCABIAYpAmA3AmAgASAGKQJoNwJoIAEgBikCcDcCcCABIAYoAng2AnggCiILIAIgAEEEahAcIAtBIGoiBEHQAGoiGUEANgIAIARBBGohGiAEQQhqIRsgBEEMaiEcIARBEGohHSAEQRRqIR4gBEEYaiEfIARBHGohICAEQSBqISEgBEEkaiEiIARBKGohIyAEQSxqISQgBEEwaiElIARBNGohJiAEQThqIScgBEE8aiEoIARBQGshKSAEQcQAaiEqIARByABqISsgBEHMAGohLEEAIQZBACECQQAhCgNAIAsgBUEDdkH///8/cUECdGooAgAgBUECdEEccXZBD3EhLSAAKAIAIQhBACEHA0AgCCAFQQp0aiAHQQZ0aigCACEDIAcgLUYiCQRAIAMhBgsgCCAFQQp0aiAHQQZ0aigCBCEDIAkEQCADIRgLIAggBUEKdGogB0EGdGooAgghAyAJBEAgAyEMCyAIIAVBCnRqIAdBBnRqKAIMIQMgCQRAIAMhDQsgCCAFQQp0aiAHQQZ0aigCECEDIAkEQCADIQILIAggBUEKdGogB0EGdGooAhQhAyAJBEAgAyEOCyAIIAVBCnRqIAdBBnRqKAIYIQMgCQRAIAMhDwsgCCAFQQp0aiAHQQZ0aigCHCEDIAkEQCADIRALIAggBUEKdGogB0EGdGooAiAhAyAJBEAgAyERCyAIIAVBCnRqIAdBBnRqKAIkIQMgCQRAIAMhEgsgCCAFQQp0aiAHQQZ0aigCKCEDIAkEQCADIRMLIAggBUEKdGogB0EGdGooAiwhAyAJBEAgAyEUCyAIIAVBCnRqIAdBBnRqKAIwIQMgCQRAIAMhCgsgCCAFQQp0aiAHQQZ0aigCNCEDIAkEQCADIRULIAggBUEKdGogB0EGdGooAjghAyAJBEAgAyEWCyAIIAVBCnRqIAdBBnRqKAI8IQMgCQRAIAMhFwsgB0EBaiIHQRBHDQALIAQgBkH///8fcTYCACAaIBhBBnRBwP//H3EgBkEadnI2AgAgGyAMQQx0QYDg/x9xIBhBFHZyNgIAIBwgDUESdEGAgPAfcSAMQQ52cjYCACAdIAJBGHRBgICAGHEgDUEIdnI2AgAgHiACQQJ2Qf///x9xNgIAIB8gDkEEdEHw//8fcSACQRx2cjYCACAgIA9BCnRBgPj/H3EgDkEWdnI2AgAgISAQQRB0QYCA/B9xIA9BEHZyNgIAICIgEEEKdjYCACAjIBFB////H3E2AgAgJCASQQZ0QcD//x9xIBFBGnZyNgIAICUgE0EMdEGA4P8fcSASQRR2cjYCACAmIBRBEnRBgIDwH3EgE0EOdnI2AgAgJyAKQRh0QYCAgBhxIBRBCHZyNgIAICggCkECdkH///8fcTYCACApIBVBBHRB8P//H3EgCkEcdnI2AgAgKiAWQQp0QYD4/x9xIBVBFnZyNgIAICsgF0EQdEGAgPwfcSAWQRB2cjYCACAsIBdBCnY2AgAgGUEANgIAIAEgASAEED0gBUEBaiIFQcAARw0ACyALJAQLmDcBMH8jBCECIwRB8AFqJAQgAkHoAWohCiACQcgBaiEJIAIhBiAAQUBrIjEoAgAEfyAGIABBIGoiGRATIAZB4ABqIhAoAgAiAkE/cSEFIBAgAkEgajYCACAGQSBqIQgCQAJAQcAAIAVrIgJBIEsEQCAAIQIgBSEEQSAhAwwBBSAIIAVqIAAgAhALGiAAIAJqIQQgBiAIEAxBICACayIDQcAASQR/IAQFIABB5ABqIAVBoH9qIg1BQHEiDkEcciAFa2ohBSADIQIgBCEDA0AgCCADKQAANwAAIAggAykACDcACCAIIAMpABA3ABAgCCADKQAYNwAYIAggAykAIDcAICAIIAMpACg3ACggCCADKQAwNwAwIAggAykAODcAOCADQUBrIQMgBiAIEAwgAkFAaiICQcAATw0ACyANIA5rIQMgBQshAiADBEBBACEEDAILCwwBCyAIIARqIAIgAxALGgsgECgCACIDQT9xIQIgECADQQFqNgIAIAZBIGohCAJAAkBBwAAgAmsiA0EBSwRAQcSRBCEEQQEhAwwBBSAIIAJqQQAgAxAYGiADQcSRBGohBCAGIAgQDEEBIANrIgNBwABJBH8gBAUgAkGBf2oiDUFAcSIOIAJrQcSSBGohBSADIQIgBCEDA0AgCCADKQAANwAAIAggAykACDcACCAIIAMpABA3ABAgCCADKQAYNwAYIAggAykAIDcAICAIIAMpACg3ACggCCADKQAwNwAwIAggAykAODcAOCADQUBrIQMgBiAIEAwgAkFAaiICQcAATw0ACyANIA5rIQMgBQshAiADBEAgAiEEQQAhAgwCCwsMAQsgCCACaiAEIAMQCxoLIAogECgCACICQR12QRh0NgIAIAogAkELdEGAgPwHcSACQRt0ciACQQV2QYD+A3FyIAJBFXZB/wFxcjYCBCAQIAJBNyACa0E/cUEBaiIDajYCACAGQSBqIQUCQAJAIANBwAAgAkE/cSICayIESQRAQfmMBCEEDAEFIAUgAmpB+YwEIAQQCxogBEH5jARqIQIgBiAFEAwgAyAEayIDQcAATwRAA0AgBSACKQAANwAAIAUgAikACDcACCAFIAIpABA3ABAgBSACKQAYNwAYIAUgAikAIDcAICAFIAIpACg3ACggBSACKQAwNwAwIAUgAikAODcAOCACQUBrIQIgBiAFEAwgA0FAaiIDQcAATw0ACwsgAwRAIAIhBEEAIQIMAgsLDAELIAUgAmogBCADEAsaCyAQKAIAIgJBP3EhBCAQIAJBCGo2AgAgBkEgaiEFAkACQEHAACAEayIDQQhLBEAgCiECQQghAwwBBSAFIARqIAogAxALGiAKIANqIQIgBiAFEAxBCCADayIDQcAATwRAA0AgBSACKQAANwAAIAUgAikACDcACCAFIAIpABA3ABAgBSACKQAYNwAYIAUgAikAIDcAICAFIAIpACg3ACggBSACKQAwNwAwIAUgAikAODcAOCACQUBrIQIgBiAFEAwgA0FAaiIDQcAATw0ACwsgAwRAQQAhBAwCCwsMAQsgBSAEaiACIAMQCxoLIAYoAgAQCSESIAZBADYCACAGQQRqIh4oAgAQCSEIIB5BADYCACAGQQhqIh8oAgAQCSENIB9BADYCACAGQQxqIiAoAgAQCSEOICBBADYCACAGQRBqIiEoAgAQCSEFICFBADYCACAGQRRqIiMoAgAQCSEEICNBADYCACAGQRhqIhMoAgAQCSEDIBNBADYCACAGQRxqIh0oAgAQ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EAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADIAIQDSAEQaABaiICIAMQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAJEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAYQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAKEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAoQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBhANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAQQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAsQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAYQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiALEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAoQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAMEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAQQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiALEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAEQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCAAIAIgBxANIAQkBAvYAwETfyMEIQIjBEHQAGokBCACIAFB0ABqEAcgAiACIAAQCiABKAIkIgZBFnYiAEHRB2wgASgCAGohBCAAQQZ0IAEoAgRqIARBGnZqIgdBGnYgASgCCGoiCEEadiABKAIMaiIJQRp2IAEoAhBqIgpBGnYgASgCFGoiC0EadiABKAIYaiIMQRp2IAEoAhxqIg1BGnYgASgCIGohBUH8/f//ACACKAIEayEOQfz///8AIAIoAghrIQ9B/P///wAgAigCDGshEEH8////ACACKAIQayERQfz///8AIAIoAhRrIRJB/P///wAgAigCGGshE0H8////ACACKAIcayEUQfz///8AIAIoAiBrIQEgAigCJCEAIAJBKGoiA0G84f//ACACKAIAayAEQf///x9xajYCACADIA4gB0H///8fcWo2AgQgAyAPIAhB////H3FqNgIIIAMgECAJQf///x9xajYCDCADIBEgCkH///8fcWo2AhAgAyASIAtB////H3FqNgIUIAMgEyAMQf///x9xajYCGCADIBQgDUH///8fcWo2AhwgAyABIAVB////H3FqNgIgIAMgBkH///8BcUH8//8HaiAAayAFQRp2ajYCJCADEBchACACJAQgAAuXEAEKfyMEIQQjBEHgA2okBCAEQdAAaiEDIARBKGohCCAEQbgDaiILIAEQByALIAsgARAKIARBkANqIgogCxAHIAogCiABEAogBEHoAmoiBiAKKQIANwIAIAYgCikCCDcCCCAGIAopAhA3AhAgBiAKKQIYNwIYIAYgCikCIDcCICAGIAYQByAGIAYQByAGIAYQByAGIAYgChAKIARBwAJqIgIgBikCADcCACACIAYpAgg3AgggAiAGKQIQNwIQIAIgBikCGDcCGCACIAYpAiA3AiAgAiACEAcgAiACEAcgAiACEAcgAiACIAoQCiAEQZgCaiIGIAIpAgA3AgAgBiACKQIINwIIIAYgAikCEDcCECAGIAIpAhg3AhggBiACKQIgNwIgIAYgBhAHIAYgBhAHIAYgBiALEAogBEHwAWoiByAGKQIANwIAIAcgBikCCDcCCCAHIAYpAhA3AhAgByAGKQIYNwIYIAcgBikCIDcCICAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcgBhAKIARByAFqIgUgBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFIAcQCiAEQaABaiICIAUpAgA3AgAgAiAFKQIINwIIIAIgBSkCEDcCECACIAUpAhg3AhggAiAFKQIgNwIgIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAiAFEAogBEH4AGoiCSACKQIANwIAIAkgAikCCDcCCCAJIAIpAhA3AhAgCSACKQIYNwIYIAkgAikCIDcCIEEAIQYDQCAJIAkQByAGQQFqIgZB2ABHDQALIAkgCSACEAogAyAJKQIANwIAIAMgCSkCCDcCCCADIAkpAhA3AhAgAyAJKQIYNwIYIAMgCSkCIDcCICADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMgBRAKIAggAykCADcCACAIIAMpAgg3AgggCCADKQIQNwIQIAggAykCGDcCGCAIIAMpAiA3AiAgCCAIEAcgCCAIEAcgCCAIEAcgCCAIIAoQCiAEIAgpAgA3AgAgBCAIKQIINwIIIAQgCCkCEDcCECAEIAgpAhg3AhggBCAIKQIgNwIgIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBCAHEAogBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEIAsQCiAEIAQQByAAIAQQByAEIAAQB0G84f//ACAEKAIAayABKAIAaiABKAIkQfz//wcgBCgCJGtqIgpBFnYiBkHRB2xqIQBB/P///wAgBCgCIGsgASgC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ACggBCABKQAwNwAwIAQgASkAODcAOCABQUBrIQEgBiAEEAwgAkFAaiICQcAATw0ACwsgAgRAQQAhAwwCCwsMAQsgBCADaiABIAIQCxoLIAYoAgAQCSEIIAZBADYCACAKKAIAEAkhCSAKQQA2AgAgCygCABAJIQogC0EANgIAIAwoAgAQCSELIAxBADYCACANKAIAEAkhByANQQA2AgAgDigCABAJIQMgDkEANgIAIA8oAgAQCSECIA9BADYCACARKAIAEAkhASAFIAg2AgAgBSAJNgIEIAUgCjYCCCAFIAs2AgwgBSAHNgIQIAUgAzYCFCAFIAI2AhggBSABNgIcIAAgBSAQEA4gBSQEC+YBAQN/IABB4ABqIgMoAgAiBEE/cSEFIAMgBCACajYCAEHAACAFayIEIAJNBEAgAEEgaiIDIAVqIAEgBBALGiABIARqIQEgACADEAwgAiAEayICQcAASQRAQQAhBQUDQCADIAEpAAA3AAAgAyABKQAINwAIIAMgASkAEDcAECADIAEpABg3ABggAyABKQAgNwAgIAMgASkAKDcAKCADIAEpADA3ADAgAyABKQA4NwA4IAFBQGshASAAIAMQDCACQUBqIgJBwABPDQBBACEFCwsLIAJFBEAPCyAAQSBqIAVqIAEgAhALGgvASwEzfyMEIQkjBEHwAWokBCAAQoGChIiQoMCAATcCACAAQoGChIiQoMCAATcCCCAAQoGChIiQoMCAATcCECAAQoGChIiQoMCAATcCGCAAQSBqIhlCADcCACAZQgA3AgggGUIANwIQIBlCADcCGCAJIgogGRATIApB4ABqIg0oAgAiCUE/cSEEIA0gCUEgajYCACAKQSBqIQsCQAJAQcAAIARrIglBIEsEQCAAIQkgBCEDQSAhCAwBBSALIARqIAAgCRALGiAAIAlqIQMgCiALEAxBICAJayIIQcAASQR/IAMFIABB5ABqIARBoH9qIgdBQHEiBkEcciAEa2ohBCAIIQkgAyEIA0AgCyAIKQAANwAAIAsgCCkACDcACCALIAgpABA3ABAgCyAIKQAYNwAYIAsgCCkAIDcAICALIAgpACg3ACggCyAIKQAwNwAwIAsgCCkAODcAOCAIQUBrIQggCiALEAwgCUFAaiIJQcAATw0ACyAHIAZrIQggBAshCSAIBEBBACEDDAILCwwBCyAL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cXIgAUEVdkH/AXFyNgIEIA0gAUE3IAFrQT9xQQFqIgJqNgIAIApBIGohBAJAAkAgAkHAACABQT9xIgFrIgNJBEBB+YwEIQMMAQUgBCABakH5jAQgAxALGiADQfmMBGohASAKIAQQDCACIANrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEAgASEDQQAhAQwCCwsMAQsgBCABaiADIAIQCxoLIA0oAgAiAUE/cSEDIA0gAUEIajYCACAKQSBqIQQCQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAQgA2ogCSACEAsaIAkgAmohASAKIAQQDEEIIAJrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAEIANqIAEgAhALGgsgCigCABAJIQ4gCkEANgIAIBooAgAQCSELIBpBADYCACAbKAIAEAkhByAbQQA2AgAgHCgCABAJIQYgHEEANgIAIB0oAgAQCSEEIB1BADYCACAeKAIAEAkhAyAeQQA2AgAgHygCABAJIQIgH0EANgIAICAoAgAQCSEBICBBADYCACAIIA42AgAgIiALNgIAICMgBzYCACAkIAY2AgAgJSAENgIAICYgAzYCACAnIAI2AgAgKCABNgIAIBEoAgAiAUE/cSEDIBEgAUEgajYCAAJAAkBBwAAgA2siBEEgSwRAIAghASADIQJBICEDDAEFIAUgA2ogCCAEEAsaIAggBGohAiAMIAUQDEEgIARrIgFBwABJBH8gASEDIAIFIANBoH9qIgNBBnZBAXQhBiAEQUBqIQQDQCAFIAIpAAA3AAAgBSACKQAINwAIIAUgAikAEDcAECAFIAIpABg3ABggBSACKQAgNwAgIAUgAikAKDcAKCAFIAIpADA3ADAgBSACKQA4NwA4IAJBQGshAiAMIAUQDCABQUBqIgFBwABPDQALIANBP3EhAyAIIAZBBGpBBXRqIARqCyEBIAMEQEEAIQIMAgsLDAELIAUgAmogASADEAsaCyAJIBEoAgAiAUEddkEYdDYCACAJIAFBC3RBgID8B3EgAUEbdHIgAUEFdkGA/gNxciABQRV2Qf8BcXI2AgQgESABQTcgAWtBP3FBAWoiAmo2AgACQAJAIAJBwAAgAUE/cSIBayIDSQRAQfmMBCEDDAEFIAUgAWpB+YwEIAMQCxogA0H5jARqIQEgDCAFEAwgAiADayICQcAATwRAA0AgBSABKQAANwAAIAUgASkACDcACCAFIAEpABA3ABAgBSABKQAYNwAYIAUgASkAIDcAICAFIAEpACg3ACggBSABKQAwNwAwIAUgASkAODcAOCABQUBrIQEgDCAFEAwgAkFAaiICQcAATw0ACwsgAgRAIAEhA0EAIQEMAgsLDAELIAUgAWogAyACEAsaCyARKAIAIgFBP3EhAyARIAFBCGo2AgACQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAUgA2ogCSACEAsaIAkgAmohASAMIAUQDEEIIAJrIgJBwABPBEADQCAFIAEpAAA3AAAgBSABKQAINwAIIAUgASkAEDcAECAFIAEpABg3ABggBSABKQAgNwAgIAUgASkAKDcAKCAFIAEpADA3ADAgBSABKQA4NwA4IAFBQGshASAMIAUQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAFIANqIAEgAhALGgsgDCgCABAJIQ4gDEEANgIAIBMoAgAQCSELIBNBADYCACAUKAIAEAkhByAUQQA2AgAgFSgCABAJIQYgFUEANgIAIBYoAgAQCSEEIBZBADYCACAXKAIAEAkhAyAXQQA2AgAgGCgCABAJIQIgGEEANgIAICEoAgAQCSEBICFBADYCACAuIA42AAAgLyALNgAAIDAgBzYAACAxIAY2AAAgMiAENgAAIDMgAzYAACA0IAI2AAAgNSABNgAAIAogGRATIA0oAgAiAUE/cSEEIA0gAUEgajYCACAKQSBqIQsCQAJAQcAAIARrIgFBIEsEQCAAIQEgBCEDQSAhAgwBBSALIARqIAAgARALGiAAIAFqIQMgCiALEAxBICABayICQcAASQR/IAMFIABB5ABqIARBoH9qIgdBQHEiBkEcciAEa2ohBCACIQEgAyECA0AgCyACKQAANwAAIAsgAikACDcACCALIAIpABA3ABAgCyACKQAYNwAYIAsgAikAIDcAICALIAIpACg3ACggCyACKQAwNwAwIAsgAikAODcAOCACQUBrIQIgCiALEAwgAUFAaiIBQcAATw0ACyAHIAZrIQIgBAshASACBEBBACEDDAILCwwBCyALIANqIAEgAhALGgsgCSANKAIAIgFBHXZBGHQ2AgAgCSABQQt0QYCA/AdxIAFBG3RyIAFBBXZBgP4DcXIgAUEVdkH/AXFyNgIEIA0gAUE3IAFrQT9xQQFqIgJqNgIAIApBIGohBAJAAkAgAkHAACABQT9xIgFrIgNJBEBB+YwEIQMMAQUgBCABakH5jAQgAxALGiADQfmMBGohASAKIAQQDCACIANrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEAgASEDQQAhAQwCCwsMAQsgBCABaiADIAIQCxoLIA0oAgAiAUE/cSEDIA0gAUEIajYCACAKQSBqIQQCQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAQgA2ogCSACEAsaIAkgAmohASAKIAQQDEEIIAJrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAEIANqIAEgAhALGgsgCigCABAJIQ4gCkEANgIAIBooAgAQCSELIBpBADYCACAbKAIAEAkhByAbQQA2AgAgHCgCABAJIQYgHEEANgIAIB0oAgAQCSEEIB1BADYCACAeKAIAEAkhAyAeQQA2AgAgHygCABAJIQIgH0EANgIAICAoAgAQCSEBICBBADYCACAIIA42AgAgIiALNgIAICMgBzYCACAkIAY2AgAgJSAENgIAICYgAzYCACAnIAI2AgAgKCABNgIAIBEoAgAiAUE/cSEDIBEgAUEgajYC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AEIANwIQIABCADcCGAsgASABKAIAIARqNgIAIAMkBEEBC9YDAQN/IwQhAyMEQYABaiQEIAAgASkCADcCACAAIAEpAgg3AgggACABKQIQNwIQIAAgASkCGDcCGCAAIAEpAiA3AiAgA0HQAGoiBSABEAcgA0EoaiIEIAEgBRAKIABBADYCUCADIAQoAgBBB2o2AgAgAyAEKAIENgIEIAMgBCgCCDYCCCADIAQoAgw2AgwgAyAEKAIQNgIQIAMgBCgCFDYCFCADIAQoAhg2AhggAyAEKAIcNgIcIAMgBCgCIDYCICADIAQoAiQ2AiQgAEEoaiIFIAMQIkUEQCADJARBAA8LIAUQFiAFKAIAIgFBAXEgAkYEQCADJARBAQ8LIAVBvOH//wAgAWs2AgAgAEEsaiIBQfz9//8AIAEoAgBrNgIAIABBMGoiAUH8////ACABKAIAazYCACAAQTRqIgFB/P///wAgASgCAGs2AgAgAEE4aiIBQfz///8AIAEoAgBrNgIAIABBPGoiAUH8////ACABKAIAazYCACAAQUBrIgFB/P///wAgASgCAGs2AgAgAEHEAGoiAUH8////ACABKAIAazYCACAAQcgAaiIBQfz///8AIAEoAgBrNgIAIABBzABqIgBB/P//ByAAKAIAazYCACADJARBAQv2CwIRfwJ+IwQhBSMEQaADaiQEIAVBuAJqIgJCADcAACACQgA3AAggAkIANwAQIAJCADcAGCACQgA3ACAgAkIANwAoIAJCADcAMCACQgA3ADggAUUEQCAAQQA2ApwBIABBJGoiA0GQiAQpAgA3AgAgA0GYiAQpAgA3AgggA0GgiAQpAgA3AhAgA0GoiAQpAgA3AhggA0GwiAQpAgA3AiAgAEEBNgJ0IABB+ABqIgNCADcCACADQgA3AgggA0IANwIQIANCADcCGCADQQA2AiAgAEGEuLznADYCTCAAQf61r/AANgJQIABBuMz59QA2AlQgAEHny/X2ADYCWCAAQcjQi/gANgJcIABB0vvu4wA2AmAgAEG8gMHtADYCZCAAQYbVuecANgJoIABB2bKj7AA2AmwgAEHG4rcHNgJwIABBATYCBCAAQQhqIgNCADcCACADQgA3AgggA0IANwIQIANBADYCGAsgBUH4AmoiBiAAQQRqIg8QESACIAYpAAA3AAAgAiAGKQAINwAIIAIgBikAEDcAECACIAYpABg3ABggAUEARyIHBEAgAkEgaiIDIAEpAAA3AAAgAyABKQAINwAIIAMgASkAEDcAECADIAEpABg3ABgLIAVBkAJqIQggBUHwAWohBCAFQfAAaiEDIAVByABqIQEgBUEEaiIQIAIgBwR/QcAABUEgCxAqIAJCADcAACACQgA3AAggAkIANwAQIAJCADcAGCACQgA3ACAgAkIANwAoIAJCADcAMCACQgA3ADggAUEEaiECIAFBCGohByABQQxqIQkgAUEQaiEKIAFBFGohCyABQRhqIQwgAUEcaiENIAFBIGohESABQSRqIRIDQCAQIAYQHyAFIAEgBhAURSIONgIAIA4EQCAFQQE2AgAMAQUgBSACKAIAIAEoAgByIAcoAgByIAkoAgByIAooAgByIAsoAgByIAwoAgByIA0oAgByIBEoAgByIBIoAgByRSIONgIAIA4NAQsLIAggARAHIABBJGoiAiACIAgQCiAAQcwAaiIHIAcgCBAKIAcgByABEAogAEH0AGoiCCAIIAEQCiABQgA3AgAgAUIANwIIIAFCADcCECABQgA3AhggAUIANwIgIARBBGohASAEQQhqIQggBEEMaiEHIARBEGohCSAEQRRqIQogBEEYaiELIARBHGohDANAIBAgBhAfIAQgBiAFEA4gBSgCAARAIAVBATYCAAwBBSAFIAEoAgAgBCgCAHIgCCgCAHIgBygCAHIgCSgCAHIgCigCAHIgCygCAHIgDCgCAHJFIg02AgAgDQ0BCwsgBkIANwAAIAZCADcACCAGQgA3ABAgBkIANwAYIAAgAyAEEB4gBCAEKAIAIgBBf3OtQsKC2YENfCITIAEoAgAiBiAAciAIKAIAIgByIAcoAgAiEHIgCSgCACINciAKKAIAIhFyIAsoAgAiEnIgDCgCACIOckEAR0EfdEEfda0iFIM+AgAgASATQiCIQoy9yf4LhCAGQX9zrXwiEyAUgz4CACAIIABBf3OtQrvAovoKfCATQiCIfCITIBSDPgIAIAcgEEF/c61C5rm71Qt8IBNCIIh8IhMgFIM+AgAgCSANQX9zrUL+////D3wgE0IgiHwiEyAUgz4CACAKIBFBf3OtQv////8PfCATQiCIfCITIBSDPgIAIAsgEkF/c61C/////w98IBNCIIh8IhMgFIM+AgAgDCAO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KSAGQQhqISogBkEMaiErIAZBEGohLCAGQRRqIS0gBkEYaiEuIAZBHGohLyAGQSBqITAgBkEkaiExIANBBGohMiADQQhqITMgA0EMaiE0IANBEGohNSADQRRqITYgA0EYaiE3IANBHGohOCADQSBqITkgA0EkaiE6IARBBGohOyAEQQhqIQkgBEEMaiEMIARBEGohDiAEQRRqIQ8gBEEYaiERIARBHGohEiAEQSBqIRMgBEEkaiEVIA0oAgBBvOH//wBqIRYgDSgCBEH8/f//AGohFyANKAIIQfz///8AaiEYIA0oAgxB/P///wBqIRkgDSgCEEH8////AGohGiANKAIUQfz///8AaiEbIA0oAhhB/P///wBqIRwgDSgCHEH8////AGohHSANKAIgQfz///8AaiEeIA0oAiRB/P//B2ohH0H/PyEBA0AgBiAHIAFBf2oiAkEGdGoiIBAjIBAgECAGEAogFCAQEAcgKCAUIBAQCiAGIAYgFBAKICkoAgAhISAqKAIAISIgKygCACEjICwoAgAhJCAtKAIAISUgLigCACEmIC8oAgAhJyAwKAIAIQsgMSgCACEFIAYgFiAGKAIAazYCACApIBcgIWs2AgAgKiAYICJrNgIAICsgGSAjazYCACAsIBogJGs2AgAgLSAbICVrNgIAIC4gHCAmazYCACAvIB0gJ2s2AgAgMCAeIAtrNgIAIDEgHyAFazYCACAKIAogKBAKIAMgBikCADcCACADIAYpAgg3AgggAyAGKQIQNwIQIAMgBikCGDcCGCADIAYpAiA3AiAgAxAPIAQgCikCADcCACAEIAopAgg3AgggBCAKKQIQNwIQIAQgCikCGDcCGCAEIAopAiA3AiAgBBAPICAgMigCACILQRp0IAMoAgByNgIAIAcgAkEGdGogMygCACIFQRR0IAtBBnZyNgIEIAcgAkEGdGogNCgCACILQQ50IAVBDHZyNgIIIAcgAkEGdGogNSgCACIFQQh0IAtBEnZyNgIMIAcgAkEGdGogNigCAEECdCAFQRh2ciA3KAIAIgVBHHRyNgIQIAcgAkEGdGogOCgCACILQRZ0IAVBBHZyNgIUIAcgAkEGdGogOSgCACIFQRB0IAtBCnZyNgIYIAcgAkEGdGogOigCAEEKdCAFQRB2cjYCHCAHIAJBBnRqIDsoAgAiC0EadCAEKAIA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IAYoAgBFBEAgBygCBCAHKAIAciAHKAIIciAHKAIMciAHKAIQciAHKAIUciAHKAIYciAHKAIccgRAIAkgAkEAEA4CQCAMIAIgA0EAIAVBACAOQQFxEQEAIgAEQCAIQQRqIRAgCEEIaiERIAhBDGohEiAIQRBqIRMgCEEUaiEUIAhBGGohFSAIQRxqIRZBACEEA0AgCCAMIAYQDiAGKAIARQRAIBAoAgAgCCgCAHIgESgCAHIgEigCAHIgEygCAHIgFCgCAHIgFSgCAHIgFigCAHIEQCAPIAogCyAHIAkgCCANEDENBAsLIAwgAiADQQAgBSAEQQFqIgQgDkEBcREBACIADQBBACEACwVBACEACwsgCUIANwIAIAlCADcCCCAJQgA3AhAgCUIANwIYIAhCADcCACAIQgA3AgggCEIANwIQIAhCADcCGCAHQgA3AgAgB0IANwIIIAdCADcCECAHQgA3AhggAARAIA0oAgAhAyABIAopAAA3AAAgASAKKQAINwAIIAEgCikAEDcAECABIAopABg3ABggAUEgaiICIAspAAA3AAAgAiALKQAINwAIIAIgCykAEDcAECACIAspABg3ABggAUFAayADOgAAIAYkBCAADwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAFBQGtBADoAACAGJARBAAv+AQECfyMEIQQjBEFAayQEIAFFBEBByooEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgA0UEQEGuigQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyAEQSBqIQUgAgR/IAUgAykAADcAACAFIAMpAAg3AAggBSADKQAQNwAQIAUgAykAGDcAGCAEIANBIGoiACkAADcAACAEIAApAAg3AAggBCAAKQAQNwAQIAQgACkAGDcAGCACIANBQGstAAA2AgAgASAFEBEgAUEgaiAEEBEgBCQEQQEFQb6MBCAAKAKoASAAKAKkAUEDcUECahEAACAEJARBAAsL7wIBA38jBCEEIwRB0ABqJAQgBEEANgIAIAFFBEBBrooEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgAkUEQEG6igQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyADQQNLBEBBpYwEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgBEEoaiIFIAIgBBAOIAQoAgAhACAEQQhqIgYgAkEgaiAEEA4gBCgCACAAckUiACECIAAEfyABIAUpAAA3AAAgASAFKQAINwAIIAEgBSkAEDcAECABIAUpABg3ABggAUEgaiIAIAYpAAA3AAAgACAGKQAINwAIIAAgBikAEDcAECAAIAYpABg3ABggAUFAayADOgAAIAQkBCACBSABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAFBQGtBADoAACAEJAQgAgsLlCoBX38jBCEHIwRBwANqJAQgB0GgAWohCCAHQfgAaiEKIAFB+ABqIUAgB0GQA2oiBiABQdAAaiI9EAcgB0HoAmoiAyABKQIANwIAIAMgASkCCDcCCCADIAEpAhA3AhAgAyABKQIYNwIYIAMgASkCIDcCICADQSRqIiUoAgAiFEEWdiIEQdEHbCADKAIAaiEFIARBBnQgA0EEaiImKAIAaiAFQRp2aiIVQRp2IANBCGoiJygCAGoiFkEadiADQQxqIhwoAgBqIhdBGnYgA0EQaiIdKAIAaiIYQRp2IANBFGoiMSgCAGoiDkEadiADQRhqIjIoAgBqIiBBGnYgA0EcaiIzKAIAaiIhQRp2IANBIGoiNCgCAGohBCADIAVB////H3E2AgAgJiAVQf///x9xNgIAICcgFkH///8fcTYCACAcIBdB////H3E2AgAgHSAYQf///x9xNgIAIDEgDkH///8fcTYCACAyICBB////H3E2AgAgMyAhQf///x9xNgIAIDQgBEH///8fcTYCACAlIARBGnYgFEH///8BcWo2AgAgB0HAAmoiBCACIAYQCiABKAJMIhlBFnYiBUHRB2wgASgCKGohGiAFQQZ0IAEoAixqIBpBGnZqIihBGnYgASgCMGoiKUEadiABKAI0aiIqQRp2IAEoAjhqIitBGnYgASgCPGoiLEEadiABQUBrKAIAaiItQRp2IAEoAkRqIiJBGnYgASgCSGohHiAHQZgCaiIFIAJBKGoiWCAGEAogBSAFID0QCiAHQfABaiIBIAMpAgA3AgAgASADKQIINwIIIAEgAykCEDcCECABIAMpAhg3AhggASAD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aiI6KAIAayETIDogEzYCAEH8////ACAKQSBqIjsoAgBrIR8gOyAfNgIAQfz//wcgCkEkaiI/KAIAayEbID8gGzYCACAuKAIAIBtqIkJBFnYiPEHRB2wgASgCACAkamohGyA8QQZ0IBQoAgAgCWpqIBtBGnZqIiRBGnYgFSgCACALamoiC0EadiAWKAIAIA9qaiIPQRp2IBcoAgAgDGpqIgxBGnYgGCgCACANamoiDUEadiAOKAIAIBJqaiISQRp2ICAoAgAgE2pqIhNBGnYgISgCACAfamohCSABIBtB////H3EiHzYCACAUICRB////H3EiGzYCACAVIAtB////H3EiCzYCACAWIA9B////H3EiDzYCACAXIAxB////H3EiDDYCACAYIA1B////H3EiDTYCACAOIBJB////H3EiEjYCACAgIBNB////H3EiEzYCACAhIAlB////H3EiJDYCACAuIAlBGnYgQkH///8BcWoiCTYCACAAIAEpAgA3AgAgACABKQIINwIIIAAgASkCEDcCECAAIAEpAhg3AhggACABKQIgNwIgIAEgH0EBdCAKKAIAajYCACAUIBtBAXQgAygCAGo2AgAgFSALQQF0IBAoAgBqNgIAIBYgD0EBdCARKAIAajYCACAXIAxBAXQgIygCAGo2AgAgGCANQQF0IDAoAgBqNgIAIA4gEkEBdCA5KAIAajYCACAgIBNBAXQgOigCAGo2AgAgISAkQQF0IDsoAgBqNgIAIC4gCUEBdCA/KAIAajYCACABIAEgBxAKIAEgASgCACAIKAIAaiIBNgIAIBQgFCgCACAeKAIAaiIDNgIAIBUgFSgCACAZKAIAaiIINgIAIBYgFigCACAlKAIAaiIKNgIAIBcgFygCACAmKAIAaiIUNgIAIBggGCgCACAnKAIAaiIVNgIAIA4gDigCACAcKAIAaiIWNgIAICAgICgCACAdKAIAaiIXNgIAICEgISgCACAiKAIAaiIYNgIAIC4gLigCACAvKAIAaiIONgIAQfj//w8gDmsiD0EWdiIOQdEHbEH4wv//ASABa2ohASAOQQZ0Qfj7//8BIANraiABQRp2aiIcQRp2Qfj///8BIAhraiIdQRp2Qfj///8BIApraiIJQRp2Qfj///8BIBRraiIQQRp2Qfj///8BIBVraiILQRp2Qfj///8BIBZraiIR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FHZyNgIwIAIgEUESdEGAgPAfcSAQQQ52cjYCNCACIAVBGHRBgICAGHEgEUEIdnI2AjggAiAFQQJ2Qf///x9xNgI8IAJBQGsgEkEEdEHw//8fcSAFQRx2cjYCACACIBNBCnRBgPj/H3EgEkEWdnI2AkQgAiAUQRB0QYCA/B9xIBNBEHZyNgJIIAIgFEEKdjYCTCACQdAAaiINQQA2AgAgDiACKAIAciAGciAHciAIciAVciADciAKciALciAMckUEQEHajAQgACgCqAEgACgCpAFBA3FBAmoRAAAgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAEJARBAA8LIARBwAJqIQogBEGYAmohCyAEQfgBaiEIIARB/ABqIQMgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAJKAIEIAkoAgByIAkoAghyIAkoAgxyIAkoAhByIAkoAhRyIAkoAhhyIAkoAhxyBH8gCEIANwIAIAhCADcCCCAIQgA3AhAgCEIANwIYIANB+ABqIgxBADYCACADIAIpAgA3AgAgAyACKQIINwIIIAMgAikCEDcCECADIAIpAhg3AhggAyACKQIgNwIgIANBKGoiBSACQShqIgYpAgA3AgAgBSAGKQIINwIIIAUgBikCEDcCECAFIAYpAhg3AhggBSAGKQIgNwIgIANBATYCUCADQdQAaiIHQgA3AgAgB0IANwIIIAdCADcCECAHQgA3AhggB0EANgIgIAAgAyADIAkgCBAZIA0gDCgCADYCACADQdAAaiIAIAAQFSAKIAAQByALIAAgChAKIAMgAyAKEAogBSAFIAsQCiAAQQE2AgAgB0IANwIAIAdCADcCCCAHQgA3AhAgB0IANwIYIAdBADYCICACIAMpAgA3AgAgAiADKQIINwIIIAIgAykCEDcCECACIAMpAhg3AhggAiADKQIgNwIgIAYgBSkCADcCACAGIAUpAgg3AgggBiAFKQIQNwIQIAYgBSkCGDcCGCAGIAUpAiA3AiAgASACEBsgBCQEQQEFIAQkBEEACwvhAgEBfyMEIQMjBEHQAGokBCADQQA2AgAgAUUEQEGIjAQgACgCqAEgACgCpAFBA3FBAmoRAAAgAyQEQQAPCyACRQRAQZeMBCAAKAKoASAAKAKkAUEDcUECahEAACADJARBAA8LIANBKGoiACACIAMQDiADQQhqIgIgAUEAEA4gAygCAAR/IAFCADcAACABQgA3AAggAUIANwAQIAFCADcAGEEABSAAKAIEIAAoAgByIAAoAghyIAAoAgxyIAAoAhByIAAoAhRyIAAoAhhyIAAoAhxyBH8gAiACIAAQDSABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggASACEBFBAQUgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYQQALCyEBIAJCADcCACACQgA3AgggAkIANwIQIAJCADcCGCAAQgA3AgAgAEIANwIIIABCADcCECAAQgA3AhggAyQEIAELgAsBE38jBCEEIwRB8AJqJAQgBEEANgIAIAAoAgBFBEBB+IoEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgAUUEQEHkiAQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyACRQRAQZeMBCAAKAKoASAAKAKkAUEDcUECahEAACAEJARBAA8LIARBCGoiFCACIAQQDiAEKAIABEAgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAEJARBAA8LIAEoAAQhBiABKAAIIQcgASgADCEIIAEoABAhAyABKAAUIQkgASgAGCEKIAEoABwhCyABKAAgIQwgASgAJCENIAEoACghDyABKAAsIRAgASgAMCEFIAEoADQhESABKAA4IRIgASgAPCETIARBKGoiAiABKAAAIg5B////H3E2AgAgAiAGQQZ0QcD//x9xIA5BGnZyIg42AgQgAiAHQQx0QYDg/x9xIAZBFHZyIgY2AgggAiAIQRJ0QYCA8B9xIAdBDnZyIgc2AgwgAiADQRh0QYCAgBhxIAhBCHZyIgg2AhAgAiADQQJ2Qf///x9xIhU2AhQgAiAJQQR0QfD//x9xIANBHHZyIgM2AhggAiAKQQp0QYD4/x9xIAlBFnZyIgk2AhwgAiALQRB0QYCA/B9xIApBEHZyIgo2AiAgAiALQQp2Igs2AiQgAiAMQf///x9xNgIoIAIgDUEGdEHA//8fcSAMQRp2cjYCLCACIA9BDHRBgOD/H3Eg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AWoiBCANQQFxEQEAIgANAEEAIQALBUEAIQALCyAJQgA3AgAgCUIANwIIIAlCADcCECAJQgA3AhggCEIANwIAIAhCADcCCCAIQgA3AhAgCEIANwIYIAdCADcCACAHQgA3AgggB0IANwIQIAdCADcCGCAABEAgASAKKQAANwAAIAEgCikACDcACCABIAopABA3ABAgASAKKQAYNwAYIAFBIGoiASALKQAANwAAIAEgCykACDcACCABIAspABA3ABAgASALKQAYNwAYIAYkBCAADwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAYkBEEAC9cCAQJ/IwQhByMEQcABaiQEIAdByABqIgYgAikAADcAACAGIAIpAAg3AAggBiACKQAQNwAQIAYgAikAGDcAGCAGQSBqIgIgASkAADcAACACIAEpAAg3AAggAiABKQAQNwAQIAIgASkAGDcAGCAEBH8gBkFAayIBIAQpAAA3AAAgASAEKQAINwAIIAEgBCkAEDcAECABIAQpABg3ABhB4AAFQcAACyEBIAMEQCAGIAFqIgIgAykAADcAACACIAMpAAg3AAggAUEQciEBCyAHIAYgARAqIAZCADcAACAGQgA3AAggBkIANwAQIAZCADcAGCAGQgA3ACAgBkIANwAoIAZCADcAMCAGQgA3ADggBkFAa0IANwAAIAZCADcASCAGQgA3AFAgBkIANwBYIAZCADcAYCAGQgA3AGhBACEBA0AgByAAEB8gAUEBaiIBIAVNDQALIAckBEEBC90QASl/IwQhBSMEQYAEaiQEIAAoAgBFBEBB+IoEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAUkBEEADwsgAkUEQEGsiwQgACgCqAEgACgCpAFBA3FBAmoRAAAgBSQEQQAPCyABRQRAQa6KBCAAKAKoASAAKAKkAUEDcUECahEAACAFJARBAA8LIANFBEBB5IgEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAUkBEEADwsgBSACQQAQDiAFQUBrIgYgASkAADcAACAGIAEpAAg3AAggBiABKQAQNwAQIAYgASkAGDcAGCAFQSBqIgQgAUEgaiIBKQAANwAAIAQgASkACDcACCAEIAEpABA3ABAgBCABKQAYNwAYIARBGGoi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////HzYCACAGQf///x82AgAgAkH///8BNgIAIAMgBxAhQQBHCwsLCwsLCwsFQQALBUEACwshACAFJAQgAAuYBQIJfwd+IwQhBCMEQSBqJAQgAkUEQEHbigQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyAEIgAgAikAADcAACAAIAIpAAg3AAggACACKQAQNwAQIAAgAikAGDcAGCACKAA4IghBf0cgAigAPCIEQR92IgVBf3MiA3EgBEH/////B0lyIAMgAigANCIJQX9HcXIgAyACKAAwIgpBf0dxciADIAIoACwiA0Hz3N3qBUlxciIGQQFzIANB89zd6gVLcSAFciIHQQFzIAIoACgiBUGdoJG9BUlxIAZyIgtBAXMgBUGdoJG9BUtxIAdyIgdBAXMgAigAJCIGQcbepP99SXEgC3JBf3MiCyAGQcbepP99S3EgB3IgCyACKAAgIgJBoMHswAZLcXIhByABRQRAIAAkBCAHDwsgBwRAIAhBf3OtQv////8PfCAJQX9zrUL/////D3wgCkF/c61C/v///w98IANBf3OtQua5u9ULfCAFQX9zrUK7wKL6CnwgBkF/c61CjL3J/gt8IAJBf3OtQsKC2YENfCIMQiCIfCIOQiCIfCIPQiCIfCIQQiCIfCIRQiCIfCISQiCIfCENIAwgBiACciAFciADciAKciAJciAIciAEckEAR0EfdEEfda0iDIOnIQIgDyAMg6chBSAQIAyDpyEDIBEgDIOnIQogEiAMg6chCSANIAyDpyEIIARBf3OtQv////8PfCANQiCIfCAMg6chBCAOIAyDpyEGCyABIAApAAA3AAAgASAAKQAINwAIIAEgACkAEDcAECABIAApABg3ABggASACNgAgIAEgBjYAJCABIAU2ACggASADNgAsIAEgCjYAMCABIAk2ADQgASAINgA4IAEgBDYAPCAAJAQgBwuDAwIGfwh+IAJFBEBB24oEIAAoAqgBIAAoAqQBQQNxQQJqEQAAQQAPCyABBH8gAigAICIAQX9zrULCgtmBDXwhCiACKAAkIgMgAHIgAigAKCIAciACKAAsIgRyIAIoADAiBXIgAigANCIGciACKAA4IgdyIAIoADwiCHJBAEdBH3RBH3WtIQkgB0F/c61C/////w98IAZBf3OtQv////8PfCAFQX9zrUL+////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';

    /* eslint-disable no-underscore-dangle, max-params, @typescript-eslint/naming-convention */
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const wrapSecp256k1Wasm$1 = (instance, heapU8, heapU32) => ({
        contextCreate: (context) => instance.exports._secp256k1_context_create(context),
        contextRandomize: (contextPtr, seedPtr) => instance.exports._secp256k1_context_randomize(contextPtr, seedPtr),
        free: (pointer) => instance.exports._free(pointer),
        heapU32,
        heapU8,
        instance,
        malloc: (bytes) => instance.exports._malloc(bytes),
        mallocSizeT: (num) => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const pointer = instance.exports._malloc(4);
            // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
            const pointerView32 = pointer >> 2;
            // eslint-disable-next-line functional/no-expression-statement
            heapU32.set([num], pointerView32);
            return pointer;
        },
        mallocUint8Array: (array) => {
            const pointer = instance.exports._malloc(array.length);
            // eslint-disable-next-line functional/no-expression-statement
            heapU8.set(array, pointer);
            return pointer;
        },
        privkeyTweakAdd: (contextPtr, secretKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_privkey_tweak_add(contextPtr, secretKeyPtr, tweakNum256Ptr),
        privkeyTweakMul: (contextPtr, secretKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_privkey_tweak_mul(contextPtr, secretKeyPtr, tweakNum256Ptr),
        pubkeyCreate: (contextPtr, publicKeyPtr, secretKeyPtr) => instance.exports._secp256k1_ec_pubkey_create(contextPtr, publicKeyPtr, secretKeyPtr),
        pubkeyParse: (contextPtr, publicKeyOutPtr, publicKeyInPtr, publicKeyInLength) => instance.exports._secp256k1_ec_pubkey_parse(contextPtr, publicKeyOutPtr, publicKeyInPtr, publicKeyInLength),
        pubkeySerialize: (contextPtr, outputPtr, outputLengthPtr, publicKeyPtr, compression) => instance.exports._secp256k1_ec_pubkey_serialize(contextPtr, outputPtr, outputLengthPtr, publicKeyPtr, compression),
        pubkeyTweakAdd: (contextPtr, publicKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_pubkey_tweak_add(contextPtr, publicKeyPtr, tweakNum256Ptr),
        pubkeyTweakMul: (contextPtr, publicKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_pubkey_tweak_mul(contextPtr, publicKeyPtr, tweakNum256Ptr),
        readHeapU8: (pointer, bytes) => new Uint8Array(heapU8.buffer, pointer, bytes),
        readSizeT: (pointer) => {
            // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
            const pointerView32 = pointer >> 2;
            return heapU32[pointerView32];
        },
        recover: (contextPtr, outputPubkeyPointer, rSigPtr, msg32Ptr) => instance.exports._secp256k1_ecdsa_recover(contextPtr, outputPubkeyPointer, rSigPtr, msg32Ptr),
        recoverableSignatureParse: (contextPtr, outputRSigPtr, inputSigPtr, rid) => instance.exports._secp256k1_ecdsa_recoverable_signature_parse_compact(contextPtr, outputRSigPtr, inputSigPtr, rid),
        recoverableSignatureSerialize: (contextPtr, sigOutPtr, recIDOutPtr, rSigPtr) => instance.exports._secp256k1_ecdsa_recoverable_signature_serialize_compact(contextPtr, sigOutPtr, recIDOutPtr, rSigPtr),
        schnorrSign: (contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_schnorr_sign(contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr),
        schnorrVerify: (contextPtr, sigPtr, msg32Ptr, publicKeyPtr) => instance.exports._secp256k1_schnorr_verify(contextPtr, sigPtr, msg32Ptr, publicKeyPtr),
        seckeyVerify: (contextPtr, secretKeyPtr) => instance.exports._secp256k1_ec_seckey_verify(contextPtr, secretKeyPtr),
        sign: (contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_ecdsa_sign(contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr),
        signRecoverable: (contextPtr, outputRSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_ecdsa_sign_recoverable(contextPtr, outputRSigPtr, msg32Ptr, secretKeyPtr),
        signatureMalleate: (contextPtr, outputSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_malleate(contextPtr, outputSigPtr, inputSigPtr),
        signatureNormalize: (contextPtr, outputSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_normalize(contextPtr, outputSigPtr, inputSigPtr),
        signatureParseCompact: (contextPtr, sigOutPtr, compactSigInPtr) => instance.exports._secp256k1_ecdsa_signature_parse_compact(contextPtr, sigOutPtr, compactSigInPtr),
        signatureParseDER: (contextPtr, sigOutPtr, sigDERInPtr, sigDERInLength) => instance.exports._secp256k1_ecdsa_signature_parse_der(contextPtr, sigOutPtr, sigDERInPtr, sigDERInLength),
        signatureSerializeCompact: (contextPtr, outputCompactSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_serialize_compact(contextPtr, outputCompactSigPtr, inputSigPtr),
        signatureSerializeDER: (contextPtr, outputDERSigPtr, outputDERSigLengthPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_serialize_der(contextPtr, outputDERSigPtr, outputDERSigLengthPtr, inputSigPtr),
        verify: (contextPtr, sigPtr, msg32Ptr, pubkeyPtr) => instance.exports._secp256k1_ecdsa_verify(contextPtr, sigPtr, msg32Ptr, pubkeyPtr),
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable functional/immutable-data, functional/no-expression-statement, @typescript-eslint/no-magic-numbers, functional/no-conditional-statement, no-bitwise, functional/no-throw-statement */
    /**
     * Method extracted from Emscripten's preamble.js
     */
    const isLittleEndian = (buffer) => {
        const littleEndian = true;
        const notLittleEndian = false;
        const heap16 = new Int16Array(buffer);
        const heap32 = new Int32Array(buffer);
        const heapU8 = new Uint8Array(buffer);
        heap32[0] = 1668509029;
        heap16[1] = 25459;
        return heapU8[2] !== 115 || heapU8[3] !== 99
            ? /* istanbul ignore next */ notLittleEndian
            : littleEndian;
    };
    /**
     * Method derived from Emscripten's preamble.js
     */
    const alignMemory = (factor, size) => Math.ceil(size / factor) * factor;
    /**
     * The most performant way to instantiate secp256k1 functionality. To avoid
     * using Node.js or DOM-specific APIs, you can use `instantiateSecp256k1`.
     *
     * Note, most of this method is translated and boiled-down from Emscripten's
     * preamble.js. Significant changes to the WASM build or breaking updates to
     * Emscripten will likely require modifications to this method.
     *
     * @param webassemblyBytes - A buffer containing the secp256k1 binary.
     */
    const instantiateSecp256k1WasmBytes = async (webassemblyBytes) => {
        const STACK_ALIGN = 16;
        const GLOBAL_BASE = 1024;
        const WASM_PAGE_SIZE = 65536;
        const TOTAL_STACK = 5242880;
        const TOTAL_MEMORY = 16777216;
        const wasmMemory = new WebAssembly.Memory({
            initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
            maximum: TOTAL_MEMORY / WASM_PAGE_SIZE,
        });
        /* istanbul ignore if  */
        if (!isLittleEndian(wasmMemory.buffer)) {
            /*
             * note: this block is excluded from test coverage. It's A) hard to test
             * (must be either tested on big-endian hardware or a big-endian buffer
             * mock) and B) extracted from Emscripten's preamble.js, where it should
             * be tested properly.
             */
            throw new Error('Runtime error: expected the system to be little-endian.');
        }
        const STATIC_BASE = GLOBAL_BASE;
        const STATICTOP_INITIAL = STATIC_BASE + 67696 + 16;
        const DYNAMICTOP_PTR = STATICTOP_INITIAL;
        const DYNAMICTOP_PTR_SIZE = 4;
        const STATICTOP = (STATICTOP_INITIAL + DYNAMICTOP_PTR_SIZE + 15) & -16;
        const STACKTOP = alignMemory(STACK_ALIGN, STATICTOP);
        const STACK_BASE = STACKTOP;
        const STACK_MAX = STACK_BASE + TOTAL_STACK;
        const DYNAMIC_BASE = alignMemory(STACK_ALIGN, STACK_MAX);
        const heapU8 = new Uint8Array(wasmMemory.buffer);
        const heap32 = new Int32Array(wasmMemory.buffer);
        const heapU32 = new Uint32Array(wasmMemory.buffer);
        heap32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
        const TABLE_SIZE = 6;
        const MAX_TABLE_SIZE = 6;
        // eslint-disable-next-line functional/no-let, @typescript-eslint/init-declarations
        let getErrNoLocation;
        /*
         * note: A number of methods below are excluded from test coverage. They are
         * a) not part of the regular usage of this library (should only be evaluated
         * if the consumer mis-implements the library and exist only to make
         * debugging easier) and B) already tested adequately in Emscripten, from
         * which this section is extracted.
         */
        const env = {
            DYNAMICTOP_PTR,
            STACKTOP,
            ___setErrNo: /* istanbul ignore next */ (value) => {
                if (getErrNoLocation !== undefined) {
                    heap32[getErrNoLocation() >> 2] = value;
                }
                return value;
            },
            _abort: /* istanbul ignore next */ (err = 'Secp256k1 Error') => {
                throw new Error(err);
            },
            // eslint-disable-next-line camelcase
            _emscripten_memcpy_big: /* istanbul ignore next */ (dest, src, num) => {
                heapU8.set(heapU8.subarray(src, src + num), dest);
                return dest;
            },
            abort: /* istanbul ignore next */ (err = 'Secp256k1 Error') => {
                throw new Error(err);
            },
            abortOnCannotGrowMemory: /* istanbul ignore next */ () => {
                throw new Error('Secp256k1 Error: abortOnCannotGrowMemory was called.');
            },
            enlargeMemory: /* istanbul ignore next */ () => {
                throw new Error('Secp256k1 Error: enlargeMemory was called.');
            },
            getTotalMemory: () => TOTAL_MEMORY,
        };
        const info = {
            env: {
                ...env,
                memory: wasmMemory,
                memoryBase: STATIC_BASE,
                table: new WebAssembly.Table({
                    element: 'anyfunc',
                    initial: TABLE_SIZE,
                    maximum: MAX_TABLE_SIZE,
                }),
                tableBase: 0,
            },
            global: { Infinity, NaN },
        };
        return WebAssembly.instantiate(webassemblyBytes, info).then((result) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
            getErrNoLocation = result.instance.exports.___errno_location;
            return wrapSecp256k1Wasm$1(result.instance, heapU8, heapU32);
        });
    };
    /* eslint-enable functional/immutable-data, functional/no-expression-statement, @typescript-eslint/no-magic-numbers, functional/no-conditional-statement, no-bitwise, functional/no-throw-statement */
    const getEmbeddedSecp256k1Binary = () => base64ToBin(secp256k1Base64Bytes).buffer;
    /**
     * An ultimately-portable (but slower) version of `instantiateSecp256k1Bytes`
     * which does not require the consumer to provide the secp256k1 binary buffer.
     */
    const instantiateSecp256k1Wasm = async () => instantiateSecp256k1WasmBytes(getEmbeddedSecp256k1Binary());

    /* eslint-disable tsdoc/syntax */
    /**
     * @hidden
     */
    // prettier-ignore
    const sha256Base64Bytes = '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IAJHDQUgAygCGCABIAIQKxoMAwsgAiEEDAELIANBMGogASACIAQQFiADQTxqKAIAIQQgAygCOCEBIAMoAjAhBSADKAI0IQIgA0EgaiAAQQxqIgYgACgCCBAXIAIgAygCJEcNBCADKAIgIAUgAhArGiAAQQhqQQA2AgAgA0EsaiAGEBgLIANBPGohAiADQThqIQUCQANAIARBP00NASADQTBqIAEgBEHAABAWIAIoAgAhBCAFKAIAIQEgA0EIakEAQcAAIAMoAjAgAygCNBAZIANBLGogAygCCBAYDAALAAsgA0EQaiAAQQxqIAQQGiADKAIUIARHDQEgAygCECABIAQQKxoLIABBCGogBDYCACADQUBrJAAPC0GEFBAHAAtBhBQQBwALQYQUEAcAC98EAgN/AX4jAEHQAGsiAiQAIAIgAUHMAGo2AiQgASkDACEFIAEoAgghBCACIAJBJGo2AigCQCAEQT9NBEAgAUEMaiIDIARqQYABOgAAIAEgASgCCEEBaiIENgIIIAJBGGogAyAEEBcgAigCGEEAIAIoAhwQLRpBwAAgASgCCGtBB00EQCACQShqIAMQGCACQRBqIAMgAUEIaigCABAaIAIoAhBBACACKAIUEC0aCyACQQhqIANBOBAXIAIoAgxBCEcNASACKAIIIAVCOIYgBUIohkKAgICAgIDA/wCDhCAFQhiGQoCAgICA4D+DIAVCCIZCgICAgPAfg4SEIAVCCIhCgICA+A+DIAVCGIhCgID8B4OEIAVCKIhCgP4DgyAFQjiIhISENwAAIAJBKGogAxAYIAFBCGpBADYCACACQQA2AiggAkEoakEEciEEQQAhAwJAA0AgA0EgRg0BIAQgA2pBADoAACACIAIoAihBAWo2AiggA0EBaiEDDAALAAsgAkFAayABQeQAaikAADcDACACQThqIAFB3ABqKQAANwMAIAJBMGogAUHUAGopAAA3AwAgAiABKQBMNwMoQQAhAwJAA0AgA0EgRg0BIAJBKGogA2oiBCAEKAIAIgRBGHQgBEEIdEGAgPwHcXIgBEEIdkGA/gNxIARBGHZycjYCACADQQRqIQMMAAsACyAAIAIpAyg3AAAgAEEYaiACQUBrKQMANwAAIABBEGogAkE4aikDADcAACAAQQhqIAJBMGopAwA3AAAgAkHQAGokAA8LQdwTIARBwAAQ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KAJsIQggASAPNgJkIAEgDjYCYCABIBM2AmggASAYNgJsIAEgAjYCdCABIBc2AnAgASAQNgJ4IAEgDDYCfCABQdAAaiABQeAAaiABQfAAaiAHQevZwaJ6aiAIQfr/+4V5ahAeIAEoAlwhByABKAJYIQggASgCUCEKIAEoAlQhESABIAI2AmQgASAXNgJgIAEgEDYCaCABIAw2AmwgASARNgJ0IAEgCjYCcCABIAg2AnggASAHNgJ8IAFB0ABqIAFB4ABqIAFB8ABqIA1B8vHFs3xqIBlB98fm93tqEB4gASgCXCENIAEoAlghGCABKAJQIRMgACAeIAEoAlRqNgIEIAAgEyAdajYCACAAIAogIWo2AgggACARICJqNgIMIAAgGCAcajYCECAAIA0gG2o2AhQgACAIICBqNgIYIAAgByAfajYCHCABQYABaiQAC30BAX8jAEEwayICJAAgAiABNgIEIAIgADYCACACQSxqQQE2AgAgAkEUakECNgIAIAJBHGpBAjYCACACQQE2AiQgAkGMFTYCCCACQQI2AgwgAkHMDTYCECACIAI2AiAgAiACQQRqNgIoIAIgAkEgajYCGCACQQhqQZwVECgAC3wBAX8jAEEwayIDJAAgAyACNgIEIAMgATYCACADQSxqQQE2AgAgA0EUakECNgIAIANBHGpBAjYCACADQQE2AiQgA0HcFDYCCCADQQI2AgwgA0HMDTYCECADIANBBGo2AiAgAyADNgIoIAMgA0EgajYCGCADQQhqIAAQKAAL1gEBBn8gACABKAIAIgggAigCBCIHcyACKAIAIgVxIAggB3FzIAVBHncgBUETd3MgBUEKd3NqIAIoAggiBkEadyAGQRV3cyAGQQd3cyAEaiABKAIMaiABKAIIIgQgAigCDCIJcyAGcSAEc2oiCmoiAjYCBCAAIAogASgCBGoiATYCDCAAIAJBHncgAkETd3MgAkEKd3MgAiAHIAVzcSAHIAVxc2ogBCADaiAJIAEgCSAGc3FzaiABQRp3IAFBFXdzIAFBB3dzaiIFajYCACAAIAUgCGo2AggLeAAgACACQRl3IAJBA3ZzIAJBDndzIAEoAgAiAmo2AgAgACACQRl3IAJBA3ZzIAJBDndzIAEoAgQiAmo2AgQgACACQRl3IAJBA3ZzIAJBDndzIAEoAggiAmo2AgggACACQRl3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';

    /**
     * The most performant way to instantiate ripemd160 functionality. To avoid
     * using Node.js or DOM-specific APIs, you can use `instantiateRipemd160`.
     *
     * @param webassemblyBytes - A buffer containing the ripemd160 binary.
     */
    const instantiateRipemd160Bytes = async (webassemblyBytes) => {
        const wasm = await instantiateRustWasm(webassemblyBytes, './ripemd160', 'ripemd160', 'ripemd160_init', 'ripemd160_update', 'ripemd160_final');
        return {
            final: wasm.final,
            hash: wasm.hash,
            init: wasm.init,
            update: wasm.update,
        };
    };
    const getEmbeddedRipemd160Binary = () => base64ToBin(ripemd160Base64Bytes).buffer;
    const cachedRipemd160 = {};
    /**
     * An ultimately-portable (but slower) version of `instantiateRipemd160Bytes`
     * which does not require the consumer to provide the ripemd160 binary buffer.
     */
    const instantiateRipemd160 = async () => {
        if (cachedRipemd160.cache !== undefined) {
            return cachedRipemd160.cache;
        }
        const result = instantiateRipemd160Bytes(getEmbeddedRipemd160Binary());
        // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
        cachedRipemd160.cache = result;
        return result;
    };

    /* eslint-disable functional/no-conditional-statement, functional/no-expression-statement, functional/no-throw-statement */
    /**
     * @param secp256k1Wasm - a Secp256k1Wasm object
     * @param randomSeed - a 32-byte random seed used to randomize the context after
     * creation
     */
    const wrapSecp256k1Wasm = (secp256k1Wasm, randomSeed) => {
        /**
         * Currently, this wrapper creates a context with both SIGN and VERIFY
         * capabilities. For better initialization performance, consumers could
         * re-implement a wrapper with only the capabilities they require.
         */
        const contextPtr = secp256k1Wasm.contextCreate(ContextFlag.BOTH);
        /**
         * Since all of these methods are single-threaded and synchronous, we can
         * reuse allocated WebAssembly memory for each method without worrying about
         * calls interfering with each other. Likewise, these spaces never need to be
         * `free`d, since we will continue using them until this entire object (and
         * with it, the entire WebAssembly instance) is garbage collected.
         *
         * If malicious javascript gained access to this object, it should be
         * considered a critical vulnerability in the consumer. However, as a best
         * practice, we zero out private keys below when we're finished with them.
         */
        const sigScratch = secp256k1Wasm.malloc(72 /* maxECDSASig */);
        const publicKeyScratch = secp256k1Wasm.malloc(65 /* maxPublicKey */);
        const messageHashScratch = secp256k1Wasm.malloc(32 /* messageHash */);
        const internalPublicKeyPtr = secp256k1Wasm.malloc(64 /* internalPublicKey */);
        const internalSigPtr = secp256k1Wasm.malloc(64 /* internalSig */);
        const schnorrSigPtr = secp256k1Wasm.malloc(64 /* schnorrSig */);
        const privateKeyPtr = secp256k1Wasm.malloc(32 /* privateKey */);
        const internalRSigPtr = secp256k1Wasm.malloc(65 /* recoverableSig */);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const recoveryNumPtr = secp256k1Wasm.malloc(4);
        // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
        const recoveryNumPtrView32 = recoveryNumPtr >> 2;
        const getRecoveryNumPtr = () => secp256k1Wasm.heapU32[recoveryNumPtrView32];
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const lengthPtr = secp256k1Wasm.malloc(4);
        // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
        const lengthPtrView32 = lengthPtr >> 2;
        const cloneAndPad = (value, expectedLength) => {
            const zeroPaddedValue = new Uint8Array(expectedLength);
            zeroPaddedValue.set(value);
            return zeroPaddedValue;
        };
        const parsePublicKey = (publicKey) => {
            const paddedPublicKey = cloneAndPad(publicKey, 65 /* maxPublicKey */);
            secp256k1Wasm.heapU8.set(paddedPublicKey, publicKeyScratch);
            return (secp256k1Wasm.pubkeyParse(contextPtr, internalPublicKeyPtr, publicKeyScratch, 
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            publicKey.length) === 1);
        };
        const setLengthPtr = (value) => {
            secp256k1Wasm.heapU32.set([value], lengthPtrView32);
        };
        const getLengthPtr = () => secp256k1Wasm.heapU32[lengthPtrView32];
        const serializePublicKey = (length, flag) => {
            setLengthPtr(length);
            secp256k1Wasm.pubkeySerialize(contextPtr, publicKeyScratch, lengthPtr, internalPublicKeyPtr, flag);
            return secp256k1Wasm.readHeapU8(publicKeyScratch, getLengthPtr()).slice();
        };
        const getSerializedPublicKey = (compressed) => compressed
            ? serializePublicKey(33 /* compressedPublicKey */, CompressionFlag.COMPRESSED)
            : serializePublicKey(65 /* uncompressedPublicKey */, CompressionFlag.UNCOMPRESSED);
        const convertPublicKey = (compressed) => (publicKey) => {
            if (!parsePublicKey(publicKey)) {
                throw new Error('Failed to parse public key.');
            }
            return getSerializedPublicKey(compressed);
        };
        const parseSignature = (signature, isDer) => {
            const paddedSignature = cloneAndPad(signature, 72 /* maxECDSASig */);
            secp256k1Wasm.heapU8.set(paddedSignature, sigScratch);
            return isDer
                ? secp256k1Wasm.signatureParseDER(contextPtr, internalSigPtr, sigScratch, signature.length) === 1
                : secp256k1Wasm.signatureParseCompact(contextPtr, internalSigPtr, sigScratch) === 1;
        };
        const parseOrThrow = (signature, isDer) => {
            if (!parseSignature(signature, isDer)) {
                throw new Error('Failed to parse signature.');
            }
        };
        const getCompactSig = () => {
            secp256k1Wasm.signatureSerializeCompact(contextPtr, sigScratch, internalSigPtr);
            return secp256k1Wasm.readHeapU8(sigScratch, 64 /* compactSig */).slice();
        };
        const getDERSig = () => {
            setLengthPtr(72 /* maxECDSASig */);
            secp256k1Wasm.signatureSerializeDER(contextPtr, sigScratch, lengthPtr, internalSigPtr);
            return secp256k1Wasm.readHeapU8(sigScratch, getLengthPtr()).slice();
        };
        const convertSignature = (wasDER) => (signature) => {
            parseOrThrow(signature, wasDER);
            return wasDER ? getCompactSig() : getDERSig();
        };
        const fillPrivateKeyPtr = (privateKey) => {
            const paddedPrivateKey = cloneAndPad(privateKey, 32 /* privateKey */);
            secp256k1Wasm.heapU8.set(paddedPrivateKey, privateKeyPtr);
        };
        const zeroOutPtr = (pointer, bytes) => {
            secp256k1Wasm.heapU8.fill(0, pointer, pointer + bytes);
        };
        const zeroOutPrivateKeyPtr = () => {
            zeroOutPtr(privateKeyPtr, 32 /* privateKey */);
        };
        const withPrivateKey = (privateKey, instructions) => {
            fillPrivateKeyPtr(privateKey);
            const ret = instructions();
            zeroOutPrivateKeyPtr();
            return ret;
        };
        const derivePublicKey = (compressed) => (privateKey) => {
            const invalid = withPrivateKey(privateKey, () => secp256k1Wasm.pubkeyCreate(contextPtr, internalPublicKeyPtr, privateKeyPtr) !== 1);
            if (invalid) {
                throw new Error('Cannot derive public key from invalid private key.');
            }
            return getSerializedPublicKey(compressed);
        };
        const fillMessageHashScratch = (messageHash) => {
            const paddedMessageHash = cloneAndPad(messageHash, 32 /* messageHash */);
            secp256k1Wasm.heapU8.set(paddedMessageHash, messageHashScratch);
        };
        const normalizeSignature = () => {
            secp256k1Wasm.signatureNormalize(contextPtr, internalSigPtr, internalSigPtr);
        };
        const modifySignature = (isDer, normalize) => (signature) => {
            parseOrThrow(signature, isDer);
            if (normalize) {
                normalizeSignature();
            }
            else {
                secp256k1Wasm.signatureMalleate(contextPtr, internalSigPtr, internalSigPtr);
            }
            return isDer ? getDERSig() : getCompactSig();
        };
        const parseAndNormalizeSignature = (signature, isDer, normalize) => {
            const ret = parseSignature(signature, isDer);
            if (normalize) {
                normalizeSignature();
            }
            return ret;
        };
        const signMessageHash = (isDer) => (privateKey, messageHash) => {
            fillMessageHashScratch(messageHash);
            return withPrivateKey(privateKey, () => {
                const failed = secp256k1Wasm.sign(contextPtr, internalSigPtr, messageHashScratch, privateKeyPtr) !== 1;
                if (failed) {
                    throw new Error('Failed to sign message hash. The private key is not valid.');
                }
                if (isDer) {
                    setLengthPtr(72 /* maxECDSASig */);
                    secp256k1Wasm.signatureSerializeDER(contextPtr, sigScratch, lengthPtr, internalSigPtr);
                    return secp256k1Wasm.readHeapU8(sigScratch, getLengthPtr()).slice();
                }
                secp256k1Wasm.signatureSerializeCompact(contextPtr, sigScratch, internalSigPtr);
                return secp256k1Wasm
                    .readHeapU8(sigScratch, 64 /* compactSig */)
                    .slice();
            });
        };
        const signMessageHashSchnorr = () => (privateKey, messageHash) => {
            fillMessageHashScratch(messageHash);
            return withPrivateKey(privateKey, () => {
                const failed = secp256k1Wasm.schnorrSign(contextPtr, schnorrSigPtr, messageHashScratch, privateKeyPtr) !== 1;
                if (failed) {
                    throw new Error('Failed to sign message hash. The private key is not valid.');
                }
                return secp256k1Wasm
                    .readHeapU8(schnorrSigPtr, 64 /* schnorrSig */)
                    .slice();
            });
        };
        const verifyMessage = (messageHash) => {
            fillMessageHashScratch(messageHash);
            return (secp256k1Wasm.verify(contextPtr, internalSigPtr, messageHashScratch, internalPublicKeyPtr) === 1);
        };
        const verifySignature = (isDer, normalize) => (signature, publicKey, messageHash) => parsePublicKey(publicKey) &&
            parseAndNormalizeSignature(signature, isDer, normalize) &&
            verifyMessage(messageHash);
        const verifyMessageSchnorr = (messageHash, signature) => {
            fillMessageHashScratch(messageHash);
            const paddedSignature = cloneAndPad(signature, 64 /* schnorrSig */);
            secp256k1Wasm.heapU8.set(paddedSignature, schnorrSigPtr);
            return (secp256k1Wasm.schnorrVerify(contextPtr, schnorrSigPtr, messageHashScratch, internalPublicKeyPtr) === 1);
        };
        const verifySignatureSchnorr = () => (signature, publicKey, messageHash) => parsePublicKey(publicKey)
            ? verifyMessageSchnorr(messageHash, signature)
            : false;
        const signMessageHashRecoverable = (privateKey, messageHash) => {
            fillMessageHashScratch(messageHash);
            return withPrivateKey(privateKey, () => {
                if (secp256k1Wasm.signRecoverable(contextPtr, internalRSigPtr, messageHashScratch, privateKeyPtr) !== 1) {
                    throw new Error('Failed to sign message hash. The private key is not valid.');
                }
                secp256k1Wasm.recoverableSignatureSerialize(contextPtr, sigScratch, recoveryNumPtr, internalRSigPtr);
                return {
                    recoveryId: getRecoveryNumPtr(),
                    signature: secp256k1Wasm
                        .readHeapU8(sigScratch, 64 /* compactSig */)
                        .slice(),
                };
            });
        };
        const recoverPublicKey = (compressed) => (signature, recoveryId, messageHash) => {
            fillMessageHashScratch(messageHash);
            const paddedSignature = cloneAndPad(signature, 72 /* maxECDSASig */);
            secp256k1Wasm.heapU8.set(paddedSignature, sigScratch);
            if (secp256k1Wasm.recoverableSignatureParse(contextPtr, internalRSigPtr, sigScratch, recoveryId) !== 1) {
                throw new Error('Failed to recover public key. Could not parse signature.');
            }
            if (secp256k1Wasm.recover(contextPtr, internalPublicKeyPtr, internalRSigPtr, messageHashScratch) !== 1) {
                throw new Error('Failed to recover public key. The compact signature, recovery, or message hash is invalid.');
            }
            return getSerializedPublicKey(compressed);
        };
        const addTweakPrivateKey = (privateKey, tweakValue) => {
            fillMessageHashScratch(tweakValue);
            return withPrivateKey(privateKey, () => {
                if (secp256k1Wasm.privkeyTweakAdd(contextPtr, privateKeyPtr, messageHashScratch) !== 1) {
                    throw new Error('Private key is invalid or adding failed.');
                }
                return secp256k1Wasm
                    .readHeapU8(privateKeyPtr, 32 /* privateKey */)
                    .slice();
            });
        };
        const mulTweakPrivateKey = (privateKey, tweakValue) => {
            fillMessageHashScratch(tweakValue);
            return withPrivateKey(privateKey, () => {
                if (secp256k1Wasm.privkeyTweakMul(contextPtr, privateKeyPtr, messageHashScratch) !== 1) {
                    throw new Error('Private key is invalid or multiplying failed.');
                }
                return secp256k1Wasm
                    .readHeapU8(privateKeyPtr, 32 /* privateKey */)
                    .slice();
            });
        };
        const addTweakPublicKey = (compressed) => (publicKey, tweakValue) => {
            if (!parsePublicKey(publicKey)) {
                throw new Error('Failed to parse public key.');
            }
            fillMessageHashScratch(tweakValue);
            if (secp256k1Wasm.pubkeyTweakAdd(contextPtr, internalPublicKeyPtr, messageHashScratch) !== 1) {
                throw new Error('Adding failed');
            }
            return getSerializedPublicKey(compressed);
        };
        const mulTweakPublicKey = (compressed) => (publicKey, tweakValue) => {
            if (!parsePublicKey(publicKey)) {
                throw new Error('Failed to parse public key.');
            }
            fillMessageHashScratch(tweakValue);
            if (secp256k1Wasm.pubkeyTweakMul(contextPtr, internalPublicKeyPtr, messageHashScratch) !== 1) {
                throw new Error('Multiplying failed');
            }
            return getSerializedPublicKey(compressed);
        };
        /**
         * The value of this precaution is debatable, especially in the context of
         * javascript and WebAssembly.
         *
         * In the secp256k1 C library, context randomization is an additional layer of
         * security from side-channel attacks which attempt to extract private key
         * information by analyzing things like a CPU's emitted radio frequencies or
         * power usage.
         *
         * In this library, these attacks seem even less likely, since the "platform"
         * on which this code will be executed (e.g. V8) is likely to obscure any
         * such signals.
         *
         * Still, out of an abundance of caution (and because no one has produced a
         * definitive proof indicating that this is not helpful), this library exposes
         * the ability to randomize the context like the C library. Depending on the
         * intended application, consumers can decide whether or not to randomize.
         */
        if (randomSeed !== undefined) {
            const randomSeedPtr = messageHashScratch;
            const paddedRandomSeed = cloneAndPad(randomSeed, 32 /* randomSeed */);
            secp256k1Wasm.heapU8.set(paddedRandomSeed, randomSeedPtr);
            secp256k1Wasm.contextRandomize(contextPtr, randomSeedPtr);
            zeroOutPtr(randomSeedPtr, 32 /* randomSeed */);
        }
        return {
            addTweakPrivateKey,
            addTweakPublicKeyCompressed: addTweakPublicKey(true),
            addTweakPublicKeyUncompressed: addTweakPublicKey(false),
            compressPublicKey: convertPublicKey(true),
            derivePublicKeyCompressed: derivePublicKey(true),
            derivePublicKeyUncompressed: derivePublicKey(false),
            malleateSignatureCompact: modifySignature(false, false),
            malleateSignatureDER: modifySignature(true, false),
            mulTweakPrivateKey,
            mulTweakPublicKeyCompressed: mulTweakPublicKey(true),
            mulTweakPublicKeyUncompressed: mulTweakPublicKey(false),
            normalizeSignatureCompact: modifySignature(false, true),
            normalizeSignatureDER: modifySignature(true, true),
            recoverPublicKeyCompressed: recoverPublicKey(true),
            recoverPublicKeyUncompressed: recoverPublicKey(false),
            signMessageHashCompact: signMessageHash(false),
            signMessageHashDER: signMessageHash(true),
            signMessageHashRecoverableCompact: signMessageHashRecoverable,
            signMessageHashSchnorr: signMessageHashSchnorr(),
            signatureCompactToDER: convertSignature(false),
            signatureDERToCompact: convertSignature(true),
            uncompressPublicKey: convertPublicKey(false),
            validatePrivateKey: (privateKey) => withPrivateKey(privateKey, () => secp256k1Wasm.seckeyVerify(contextPtr, privateKeyPtr) === 1),
            validatePublicKey: parsePublicKey,
            verifySignatureCompact: verifySignature(false, true),
            verifySignatureCompactLowS: verifySignature(false, false),
            verifySignatureDER: verifySignature(true, true),
            verifySignatureDERLowS: verifySignature(true, false),
            verifySignatureSchnorr: verifySignatureSchnorr(),
        };
    };
    const cachedSecp256k1 = {};
    /**
     * Create and wrap a Secp256k1 WebAssembly instance to expose a set of
     * purely-functional Secp256k1 methods. For slightly faster initialization, use
     * `instantiateSecp256k1Bytes`.
     *
     * @param randomSeed - a 32-byte random seed used to randomize the secp256k1
     * context after creation. See the description in `instantiateSecp256k1Bytes`
     * for details.
     */
    const instantiateSecp256k1 = async (randomSeed) => {
        if (cachedSecp256k1.cache !== undefined) {
            return cachedSecp256k1.cache;
        }
        const result = Promise.resolve(wrapSecp256k1Wasm(await instantiateSecp256k1Wasm(), randomSeed));
        // eslint-disable-next-line require-atomic-updates, functional/immutable-data
        cachedSecp256k1.cache = result;
        return result;
    };

    /**
     * The most performant way to instantiate sha256 functionality. To avoid
     * using Node.js or DOM-specific APIs, you can use `instantiateSha256`.
     *
     * @param webassemblyBytes - A buffer containing the sha256 binary.
     */
    const instantiateSha256Bytes = async (webassemblyBytes) => {
        const wasm = await instantiateRustWasm(webassemblyBytes, './sha256', 'sha256', 'sha256_init', 'sha256_update', 'sha256_final');
        return {
            final: wasm.final,
            hash: wasm.hash,
            init: wasm.init,
            update: wasm.update,
        };
    };
    const getEmbeddedSha256Binary = () => base64ToBin(sha256Base64Bytes).buffer;
    const cachedSha256 = {};
    /**
     * An ultimately-portable (but possibly slower) version of
     * `instantiateSha256Bytes` which does not require the consumer to provide the
     * sha256 binary buffer.
     */
    const instantiateSha256 = async () => {
        if (cachedSha256.cache !== undefined) {
            return cachedSha256.cache;
        }
        const result = instantiateSha256Bytes(getEmbeddedSha256Binary());
        // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
        cachedSha256.cache = result;
        return result;
    };

    /**
     * @param bin - the raw transaction from which to read the input
     * @param offset - the offset at which the input begins
     */
    const readTransactionInput = (bin, offset) => {
        const sha256HashBytes = 32;
        const uint32Bytes = 4;
        const offsetAfterTxHash = offset + sha256HashBytes;
        const outpointTransactionHash = bin
            .slice(offset, offsetAfterTxHash)
            .reverse();
        const offsetAfterOutpointIndex = offsetAfterTxHash + uint32Bytes;
        const outpointIndex = binToNumberUint32LE(bin.subarray(offsetAfterTxHash, offsetAfterOutpointIndex));
        const { nextOffset: offsetAfterBytecodeLength, value: bytecodeLength, } = readBitcoinVarInt(bin, offsetAfterOutpointIndex);
        const offsetAfterBytecode = offsetAfterBytecodeLength + Number(bytecodeLength);
        const unlockingBytecode = bin.slice(offsetAfterBytecodeLength, offsetAfterBytecode);
        const nextOffset = offsetAfterBytecode + uint32Bytes;
        const sequenceNumber = binToNumberUint32LE(bin.subarray(offsetAfterBytecode, nextOffset));
        return {
            input: {
                outpointIndex,
                outpointTransactionHash,
                sequenceNumber,
                unlockingBytecode,
            },
            nextOffset,
        };
    };
    /**
     * Encode a single input for inclusion in an encoded transaction.
     *
     * @param output - the input to encode
     */
    const encodeInput = (input) => flattenBinArray([
        input.outpointTransactionHash.slice().reverse(),
        numberToBinUint32LE(input.outpointIndex),
        bigIntToBitcoinVarInt(BigInt(input.unlockingBytecode.length)),
        input.unlockingBytecode,
        numberToBinUint32LE(input.sequenceNumber),
    ]);
    /**
     * Encode a set of inputs for inclusion in an encoded transaction including
     * the prefixed number of inputs.
     *
     * Format: [BitcoinVarInt: input count] [encoded inputs]
     *
     * @param inputs - the set of inputs to encode
     */
    const encodeInputs = (inputs) => flattenBinArray([
        bigIntToBitcoinVarInt(BigInt(inputs.length)),
        ...inputs.map(encodeInput),
    ]);
    /**
     * Read a single transaction output from an encoded transaction.
     *
     * @param bin - the raw transaction from which to read the output
     * @param offset - the offset at which the output begins
     */
    const readTransactionOutput = (bin, offset) => {
        const uint64Bytes = 8;
        const offsetAfterSatoshis = offset + uint64Bytes;
        const satoshis = bin.slice(offset, offsetAfterSatoshis);
        const { nextOffset: offsetAfterScriptLength, value } = readBitcoinVarInt(bin, offsetAfterSatoshis);
        const bytecodeLength = Number(value);
        const nextOffset = offsetAfterScriptLength + bytecodeLength;
        const lockingBytecode = bytecodeLength === 0
            ? new Uint8Array()
            : bin.slice(offsetAfterScriptLength, nextOffset);
        return {
            nextOffset,
            output: {
                lockingBytecode,
                satoshis,
            },
        };
    };
    /**
     * Encode a single output for inclusion in an encoded transaction.
     *
     * @param output - the output to encode
     */
    const encodeOutput = (output) => flattenBinArray([
        output.satoshis,
        bigIntToBitcoinVarInt(BigInt(output.lockingBytecode.length)),
        output.lockingBytecode,
    ]);
    /**
     * Encode a set of outputs for inclusion in an encoded transaction
     * including the prefixed number of outputs.
     *
     * Format: [BitcoinVarInt: output count] [encoded outputs]
     *
     * @param outputs - the set of outputs to encode
     */
    const encodeOutputsForTransaction = (outputs) => flattenBinArray([
        bigIntToBitcoinVarInt(BigInt(outputs.length)),
        ...outputs.map(encodeOutput),
    ]);
    /**
     * Decode a `Uint8Array` using the version 1 or 2 raw transaction format.
     *
     * Note: this method throws runtime errors when attempting to decode messages
     * which do not properly follow the transaction format. If the input is
     * untrusted, use `decodeTransaction`.
     *
     * @param bin - the raw message to decode
     */
    const decodeTransactionUnsafe = (bin) => {
        const uint32Bytes = 4;
        const version = binToNumberUint32LE(bin.subarray(0, uint32Bytes));
        const offsetAfterVersion = uint32Bytes;
        const { nextOffset: offsetAfterInputCount, value: inputCount, } = readBitcoinVarInt(bin, offsetAfterVersion);
        // eslint-disable-next-line functional/no-let
        let cursor = offsetAfterInputCount;
        const inputs = [];
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
        for (let i = 0; i < Number(inputCount); i++) {
            const { input, nextOffset } = readTransactionInput(bin, cursor);
            // eslint-disable-next-line functional/no-expression-statement
            cursor = nextOffset;
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            inputs.push(input);
        }
        const { nextOffset: offsetAfterOutputCount, value: outputCount, } = readBitcoinVarInt(bin, cursor);
        // eslint-disable-next-line functional/no-expression-statement
        cursor = offsetAfterOutputCount;
        const outputs = [];
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
        for (let i = 0; i < Number(outputCount); i++) {
            const { output, nextOffset } = readTransactionOutput(bin, cursor);
            // eslint-disable-next-line functional/no-expression-statement
            cursor = nextOffset;
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            outputs.push(output);
        }
        const locktime = binToNumberUint32LE(bin.subarray(cursor, cursor + uint32Bytes));
        return {
            inputs,
            locktime,
            outputs,
            version,
        };
    };
    var TransactionDecodingError;
    (function (TransactionDecodingError) {
        TransactionDecodingError["invalidFormat"] = "Transaction decoding error: message does not follow the version 1 or version 2 transaction format.";
    })(TransactionDecodingError || (TransactionDecodingError = {}));
    /**
     * Decode a `Uint8Array` using the version 1 or 2 raw transaction format.
     *
     * @param bin - the raw message to decode
     */
    const decodeTransaction = (bin) => {
        // eslint-disable-next-line functional/no-try-statement
        try {
            return decodeTransactionUnsafe(bin);
        }
        catch {
            return TransactionDecodingError.invalidFormat;
        }
    };
    /**
     * Encode a `Transaction` using the standard P2P network format. This
     * serialization is also used when computing the transaction's hash (A.K.A.
     * "transaction ID" or "TXID").
     */
    const encodeTransaction = (tx) => flattenBinArray([
        numberToBinUint32LE(tx.version),
        encodeInputs(tx.inputs),
        encodeOutputsForTransaction(tx.outputs),
        numberToBinUint32LE(tx.locktime),
    ]);
    /**
     * Get the hash of all outpoints in a series of inputs. (For use in
     * `hashTransactionOutpoints`.)
     *
     * @param inputs - the series of inputs from which to extract the outpoints
     * @param sha256 - an implementation of sha256
     */
    const encodeOutpoints = (inputs) => flattenBinArray(inputs.map((i) => flattenBinArray([
        i.outpointTransactionHash.slice().reverse(),
        numberToBinUint32LE(i.outpointIndex),
    ])));
    /**
     * Encode an array of transaction outputs for use in transaction signing
     * serializations.
     *
     * @param outputs - the array of outputs to encode
     */
    const encodeOutputsForSigning = (outputs) => flattenBinArray(outputs.map(encodeOutput));
    /**
     * Encode an array of input sequence numbers for use in transaction signing
     * serializations.
     *
     * @param inputs - the array of inputs from which to extract the sequence
     * numbers
     */
    const encodeSequenceNumbersForSigning = (inputs) => flattenBinArray(inputs.map((i) => numberToBinUint32LE(i.sequenceNumber)));

    var ScriptNumberError;
    (function (ScriptNumberError) {
        ScriptNumberError["outOfRange"] = "Failed to parse Script Number: overflows Script Number range.";
        ScriptNumberError["requiresMinimal"] = "Failed to parse Script Number: the number is not minimally-encoded.";
    })(ScriptNumberError || (ScriptNumberError = {}));
    const isScriptNumberError = (value) => value === ScriptNumberError.outOfRange ||
        value === ScriptNumberError.requiresMinimal;
    const normalMaximumScriptNumberByteLength = 4;
    /**
     * This method attempts to parse a "Script Number", a format with which numeric
     * values are represented on the stack. (The Satoshi implementation calls this
     * `CScriptNum`.)
     *
     * If `bytes` is a valid Script Number, this method returns the represented
     * number in BigInt format. If `bytes` is not valid, a `ScriptNumberError` is
     * returned.
     *
     * All common operations accepting numeric parameters or pushing numeric values
     * to the stack currently use the Script Number format. The binary format of
     * numbers wouldn't be important if they could only be operated on by arithmetic
     * operators, but since the results of these operations may become input to
     * other operations (e.g. hashing), the specific representation is consensus-
     * critical.
     *
     * Parsing of Script Numbers is limited to 4 bytes (with the exception of
     * OP_CHECKLOCKTIMEVERIFY and OP_CHECKSEQUENCEVERIFY, which read up to 5-bytes).
     * The bytes are read as a signed integer (for 32-bits: inclusive range from
     * -2^31 + 1 to 2^31 - 1) in little-endian byte order. Script Numbers must
     * further be encoded as minimally as possible (no zero-padding). See code/tests
     * for details.
     *
     * @remarks
     * Operators may push numeric results to the stack which exceed the current
     * 4-byte length limit of Script Numbers. While these stack elements would
     * otherwise be valid Script Numbers, because of the 4-byte length limit, they
     * can only be used as non-numeric values in later operations.
     *
     * Most other implementations currently parse Script Numbers into 64-bit
     * integers to operate on them (rather than integers of arbitrary size like
     * BigInt). Currently, no operators are at risk of overflowing 64-bit integers
     * given 32-bit integer inputs, but future operators may require additional
     * refactoring in those implementations.
     *
     * @param bytes - a Uint8Array from the stack
     * @param requireMinimalEncoding - if true, this method returns an error when
     * parsing non-minimally encoded Script Numbers
     * @param maximumScriptNumberByteLength - the maximum valid number of bytes
     */
    // eslint-disable-next-line complexity
    const parseBytesAsScriptNumber = (bytes, { maximumScriptNumberByteLength = normalMaximumScriptNumberByteLength, requireMinimalEncoding = true, } = {
        maximumScriptNumberByteLength: normalMaximumScriptNumberByteLength,
        requireMinimalEncoding: true,
    }) => {
        if (bytes.length === 0) {
            return BigInt(0);
        }
        if (bytes.length > maximumScriptNumberByteLength) {
            return ScriptNumberError.outOfRange;
        }
        const mostSignificantByte = bytes[bytes.length - 1];
        const secondMostSignificantByte = bytes[bytes.length - 1 - 1];
        const allButTheSignBit = 127;
        const justTheSignBit = 128;
        if (requireMinimalEncoding &&
            // eslint-disable-next-line no-bitwise
            (mostSignificantByte & allButTheSignBit) === 0 &&
            // eslint-disable-next-line no-bitwise
            (bytes.length <= 1 || (secondMostSignificantByte & justTheSignBit) === 0)) {
            return ScriptNumberError.requiresMinimal;
        }
        const bitsPerByte = 8;
        const signFlippingByte = 0x80;
        // eslint-disable-next-line functional/no-let
        let result = BigInt(0);
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
        for (let byte = 0; byte < bytes.length; byte++) {
            // eslint-disable-next-line functional/no-expression-statement,  no-bitwise
            result |= BigInt(bytes[byte]) << BigInt(byte * bitsPerByte);
        }
        /* eslint-disable no-bitwise */
        const isNegative = (bytes[bytes.length - 1] & signFlippingByte) !== 0;
        return isNegative
            ? -(result &
                ~(BigInt(signFlippingByte) << BigInt(bitsPerByte * (bytes.length - 1))))
            : result;
        /* eslint-enable no-bitwise */
    };
    /**
     * Convert a BigInt into the "Script Number" format. See
     * `parseBytesAsScriptNumber` for more information.
     *
     * @param integer - the BigInt to encode as a Script Number
     */
    // eslint-disable-next-line complexity
    const bigIntToScriptNumber = (integer) => {
        if (integer === BigInt(0)) {
            return new Uint8Array();
        }
        const bytes = [];
        const isNegative = integer < 0;
        const byteStates = 0xff;
        const bitsPerByte = 8;
        // eslint-disable-next-line functional/no-let
        let remaining = isNegative ? -integer : integer;
        // eslint-disable-next-line functional/no-loop-statement
        while (remaining > 0) {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data, no-bitwise
            bytes.push(Number(remaining & BigInt(byteStates)));
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise
            remaining >>= BigInt(bitsPerByte);
        }
        const signFlippingByte = 0x80;
        // eslint-disable-next-line no-bitwise, functional/no-conditional-statement
        if ((bytes[bytes.length - 1] & signFlippingByte) > 0) {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            bytes.push(isNegative ? signFlippingByte : 0x00);
            // eslint-disable-next-line functional/no-conditional-statement
        }
        else if (isNegative) {
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data, no-bitwise
            bytes[bytes.length - 1] |= signFlippingByte;
        }
        return new Uint8Array(bytes);
    };

    /**
     * A type-guard which checks if the provided instruction is malformed.
     * @param instruction - the instruction to check
     */
    const authenticationInstructionIsMalformed = (instruction) => 'malformed' in instruction;
    var CommonPushOpcodes;
    (function (CommonPushOpcodes) {
        CommonPushOpcodes[CommonPushOpcodes["OP_0"] = 0] = "OP_0";
        CommonPushOpcodes[CommonPushOpcodes["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
        CommonPushOpcodes[CommonPushOpcodes["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
        CommonPushOpcodes[CommonPushOpcodes["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
    })(CommonPushOpcodes || (CommonPushOpcodes = {}));
    const uint8Bytes = 1;
    const uint16Bytes = 2;
    const uint32Bytes = 4;
    const readLittleEndianNumber = (script, index, length) => {
        const view = new DataView(script.buffer, index, length);
        const readAsLittleEndian = true;
        return length === uint8Bytes
            ? view.getUint8(0)
            : length === uint16Bytes
                ? view.getUint16(0, readAsLittleEndian)
                : view.getUint32(0, readAsLittleEndian);
    };
    /**
     * Returns the number of bytes used to indicate the length of the push in this
     * operation.
     * @param opcode - an opcode between 0x00 and 0x4e
     */
    const lengthBytesForPushOpcode = (opcode) => opcode < CommonPushOpcodes.OP_PUSHDATA_1
        ? 0
        : opcode === CommonPushOpcodes.OP_PUSHDATA_1
            ? uint8Bytes
            : opcode === CommonPushOpcodes.OP_PUSHDATA_2
                ? uint16Bytes
                : uint32Bytes;
    /**
     * Parse one instruction from the provided script.
     *
     * Returns an object with an `instruction` referencing a
     * `ParsedAuthenticationInstruction`, and a `nextIndex` indicating the next
     * index from which to read. If the next index is greater than or equal to the
     * length of the script, the script has been fully parsed.
     *
     * The final `ParsedAuthenticationInstruction` from a serialized script may be
     * malformed if 1) the final operation is a push and 2) too few bytes remain for
     * the push operation to complete.
     *
     * @param script - the script from which to read the next instruction
     * @param index - the offset from which to begin reading
     */
    // eslint-disable-next-line complexity
    const readAuthenticationInstruction = (script, index) => {
        const opcode = script[index];
        if (opcode > CommonPushOpcodes.OP_PUSHDATA_4) {
            return {
                instruction: {
                    opcode: opcode,
                },
                nextIndex: index + 1,
            };
        }
        const lengthBytes = lengthBytesForPushOpcode(opcode);
        if (lengthBytes !== 0 && index + lengthBytes >= script.length) {
            const sliceStart = index + 1;
            const sliceEnd = sliceStart + lengthBytes;
            return {
                instruction: {
                    expectedLengthBytes: lengthBytes,
                    length: script.slice(sliceStart, sliceEnd),
                    malformed: true,
                    opcode: opcode,
                },
                nextIndex: sliceEnd,
            };
        }
        const dataBytes = lengthBytes === 0
            ? opcode
            : readLittleEndianNumber(script, index + 1, lengthBytes);
        const dataStart = index + 1 + lengthBytes;
        const dataEnd = dataStart + dataBytes;
        return {
            instruction: {
                data: script.slice(dataStart, dataEnd),
                ...(dataEnd > script.length
                    ? {
                        expectedDataBytes: dataEnd - dataStart,
                        malformed: true,
                    }
                    : undefined),
                opcode: opcode,
            },
            nextIndex: dataEnd,
        };
    };
    /**
     * Parse authentication bytecode (`lockingBytecode` or `unlockingBytecode`)
     * into `ParsedAuthenticationInstructions`. The method
     * `authenticationInstructionsAreMalformed` can be used to check if these
     * instructions include a malformed instruction. If not, they are valid
     * `AuthenticationInstructions`.
     *
     * This implementation is common to most bitcoin forks, but the type parameter
     * can be used to strongly type the resulting instructions. For example:
     *
     * ```js
     *  const instructions = parseAuthenticationBytecode<OpcodesBCH>(script);
     * ```
     *
     * @param script - the serialized script to parse
     */
    const parseBytecode = (script) => {
        const instructions = [];
        // eslint-disable-next-line functional/no-let
        let i = 0;
        // eslint-disable-next-line functional/no-loop-statement
        while (i < script.length) {
            const { instruction, nextIndex } = readAuthenticationInstruction(script, i);
            // eslint-disable-next-line functional/no-expression-statement
            i = nextIndex;
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            instructions.push(instruction);
        }
        return instructions;
    };
    /**
     * OP_0 is the only single-word push. All other push instructions will
     * disassemble to multiple ASM words. (OP_1-OP_16 are handled like normal
     * operations.)
     */
    const isMultiWordPush = (opcode) => opcode !== CommonPushOpcodes.OP_0;
    const formatAsmPushHex = (data) => data.length > 0 ? `0x${binToHex(data)}` : '';
    const formatMissingBytesAsm = (missing) => `[missing ${missing} byte${missing === 1 ? '' : 's'}]`;
    const hasMalformedLength = (instruction) => 'length' in instruction;
    const isPushData = (pushOpcode) => pushOpcode >= CommonPushOpcodes.OP_PUSHDATA_1;
    /**
     * Disassemble a malformed authentication instruction into a string description.
     * @param opcodes - a mapping of possible opcodes to their string representation
     * @param instruction - the malformed instruction to disassemble
     */
    const disassembleParsedAuthenticationInstructionMalformed = (opcodes, instruction) => `${opcodes[instruction.opcode]} ${hasMalformedLength(instruction)
    ? `${formatAsmPushHex(instruction.length)}${formatMissingBytesAsm(instruction.expectedLengthBytes - instruction.length.length)}`
    : `${isPushData(instruction.opcode)
        ? `${instruction.expectedDataBytes} `
        : ''}${formatAsmPushHex(instruction.data)}${formatMissingBytesAsm(instruction.expectedDataBytes - instruction.data.length)}`}`;
    /**
     * Disassemble a properly-formed authentication instruction into a string
     * description.
     * @param opcodes - a mapping of possible opcodes to their string representation
     * @param instruction - the instruction to disassemble
     */
    const disassembleAuthenticationInstruction = (opcodes, instruction) => `${opcodes[instruction.opcode]}${'data' in instruction &&
    isMultiWordPush(instruction.opcode)
    ? ` ${isPushData(instruction.opcode)
        ? `${instruction.data.length} `
        : ''}${formatAsmPushHex(instruction.data)}`
    : ''}`;
    /**
     * Disassemble a single `ParsedAuthenticationInstruction` (includes potentially
     * malformed instructions) into its ASM representation.
     *
     * @param script - the instruction to disassemble
     */
    const disassembleParsedAuthenticationInstruction = (opcodes, instruction) => authenticationInstructionIsMalformed(instruction)
        ? disassembleParsedAuthenticationInstructionMalformed(opcodes, instruction)
        : disassembleAuthenticationInstruction(opcodes, instruction);
    /**
     * Disassemble an array of `ParsedAuthenticationInstructions` (including
     * potentially malformed instructions) into its ASM representation.
     *
     * @param script - the array of instructions to disassemble
     */
    const disassembleParsedAuthenticationInstructions = (opcodes, instructions) => instructions
        .map((instruction) => disassembleParsedAuthenticationInstruction(opcodes, instruction))
        .join(' ');
    /**
     * Disassemble BCH authentication bytecode into its ASM representation.
     * @param bytecode - the authentication bytecode to disassemble
     */
    const disassembleBytecodeBCH = (bytecode) => disassembleParsedAuthenticationInstructions(OpcodesBCH, parseBytecode(bytecode));
    const getInstructionLengthBytes = (instruction) => {
        const opcode = instruction.opcode;
        const expectedLength = lengthBytesForPushOpcode(opcode);
        return expectedLength === uint8Bytes
            ? Uint8Array.of(instruction.data.length)
            : expectedLength === uint16Bytes
                ? numberToBinUint16LE(instruction.data.length)
                : numberToBinUint32LE(instruction.data.length);
    };
    /**
     * Re-serialize a valid authentication instruction.
     * @param instruction - the instruction to serialize
     */
    const serializeAuthenticationInstruction = (instruction) => Uint8Array.from([
        instruction.opcode,
        ...('data' in instruction
            ? [
                ...(isPushData(instruction.opcode)
                    ? getInstructionLengthBytes(instruction)
                    : []),
                ...instruction.data,
            ]
            : []),
    ]);
    /**
     * Re-serialize an array of valid authentication instructions.
     * @param instructions - the array of valid instructions to serialize
     */
    const serializeAuthenticationInstructions = (instructions) => flattenBinArray(instructions.map(serializeAuthenticationInstruction));

    /**
     * A.K.A. `sighash` flags
     */
    var SigningSerializationFlag;
    (function (SigningSerializationFlag) {
        /**
         * A.K.A. `SIGHASH_ALL`
         */
        SigningSerializationFlag[SigningSerializationFlag["allOutputs"] = 1] = "allOutputs";
        /**
         * A.K.A `SIGHASH_NONE`
         */
        SigningSerializationFlag[SigningSerializationFlag["noOutputs"] = 2] = "noOutputs";
        /**
         * A.K.A. `SIGHASH_SINGLE`
         */
        SigningSerializationFlag[SigningSerializationFlag["correspondingOutput"] = 3] = "correspondingOutput";
        SigningSerializationFlag[SigningSerializationFlag["forkId"] = 64] = "forkId";
        /**
         * A.K.A `ANYONE_CAN_PAY`
         */
        SigningSerializationFlag[SigningSerializationFlag["singleInput"] = 128] = "singleInput";
    })(SigningSerializationFlag || (SigningSerializationFlag = {}));
    const match = (type, flag) => 
    // eslint-disable-next-line no-bitwise
    (type[0] & flag) !== 0;
    const equals = (type, flag
    // eslint-disable-next-line no-bitwise
    ) => (type[0] & 31 /* mask5Bits */) === flag;
    const shouldSerializeSingleInput = (type) => match(type, SigningSerializationFlag.singleInput);
    const shouldSerializeCorrespondingOutput = (type) => equals(type, SigningSerializationFlag.correspondingOutput);
    const shouldSerializeNoOutputs = (type) => equals(type, SigningSerializationFlag.noOutputs);
    const emptyHash = () => new Uint8Array(32 /* sha256HashByteLength */).fill(0);
    /**
     * Return the proper `hashPrevouts` value for a given a signing serialization
     * type.
     * @param signingSerializationType - the signing serialization type to test
     * @param transactionOutpoints - see `generateSigningSerializationBCH`
     */
    const hashPrevouts = ({ sha256, signingSerializationType, transactionOutpoints, }) => shouldSerializeSingleInput(signingSerializationType)
        ? emptyHash()
        : sha256.hash(sha256.hash(transactionOutpoints));
    /**
     * Return the proper `hashSequence` value for a given a signing serialization
     * type.
     * @param signingSerializationType - the signing serialization type to test
     * @param transactionSequenceNumbers - see
     * `generateSigningSerializationBCH`
     */
    const hashSequence = ({ sha256, signingSerializationType, transactionSequenceNumbers, }) => !shouldSerializeSingleInput(signingSerializationType) &&
        !shouldSerializeCorrespondingOutput(signingSerializationType) &&
        !shouldSerializeNoOutputs(signingSerializationType)
        ? sha256.hash(sha256.hash(transactionSequenceNumbers))
        : emptyHash();
    /**
     * Return the proper `hashOutputs` value for a given a signing serialization
     * type.
     * @param signingSerializationType - the signing serialization type to test
     * @param transactionOutputs - see `generateSigningSerializationBCH`
     * @param correspondingOutput - see `generateSigningSerializationBCH`
     */
    const hashOutputs = ({ correspondingOutput, sha256, signingSerializationType, transactionOutputs, }) => !shouldSerializeCorrespondingOutput(signingSerializationType) &&
        !shouldSerializeNoOutputs(signingSerializationType)
        ? sha256.hash(sha256.hash(transactionOutputs))
        : shouldSerializeCorrespondingOutput(signingSerializationType)
            ? correspondingOutput === undefined
                ? emptyHash()
                : sha256.hash(sha256.hash(correspondingOutput))
            : emptyHash();
    /**
     * Serialize the signature-protected properties of a transaction following the
     * algorithm required by the `signingSerializationType` of a signature.
     *
     * Note: this implementation re-computes all hashes each time it is called. A
     * performance-critical application could instead use memoization to avoid
     * re-computing these values when validating many signatures within a single
     * transaction. See BIP143 for details.
     */
    const generateSigningSerializationBCH = ({ correspondingOutput, coveredBytecode, forkId = new Uint8Array([0, 0, 0]), locktime, outpointIndex, outpointTransactionHash, outputValue, sequenceNumber, sha256, signingSerializationType, transactionOutpoints, transactionOutputs, transactionSequenceNumbers, version, }) => flattenBinArray([
        numberToBinUint32LE(version),
        hashPrevouts({ sha256, signingSerializationType, transactionOutpoints }),
        hashSequence({
            sha256,
            signingSerializationType,
            transactionSequenceNumbers,
        }),
        outpointTransactionHash.slice().reverse(),
        numberToBinUint32LE(outpointIndex),
        bigIntToBitcoinVarInt(BigInt(coveredBytecode.length)),
        coveredBytecode,
        outputValue,
        numberToBinUint32LE(sequenceNumber),
        hashOutputs({
            correspondingOutput,
            sha256,
            signingSerializationType,
            transactionOutputs,
        }),
        numberToBinUint32LE(locktime),
        signingSerializationType,
        forkId,
    ]);

    var PushOperationConstants;
    (function (PushOperationConstants) {
        PushOperationConstants[PushOperationConstants["OP_0"] = 0] = "OP_0";
        /**
         * OP_PUSHBYTES_75
         */
        PushOperationConstants[PushOperationConstants["maximumPushByteOperationSize"] = 75] = "maximumPushByteOperationSize";
        PushOperationConstants[PushOperationConstants["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
        PushOperationConstants[PushOperationConstants["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
        PushOperationConstants[PushOperationConstants["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
        /**
         * OP_PUSHDATA_4
         */
        PushOperationConstants[PushOperationConstants["highestPushDataOpcode"] = 78] = "highestPushDataOpcode";
        /**
         * For OP_1 to OP_16, `opcode` is the number offset by `0x50` (80):
         *
         * `OP_N = 0x50 + N`
         *
         * OP_0 is really OP_PUSHBYTES_0 (`0x00`), so it does not follow this pattern.
         */
        PushOperationConstants[PushOperationConstants["pushNumberOpcodesOffset"] = 80] = "pushNumberOpcodesOffset";
        /** OP_1 through OP_16 */
        PushOperationConstants[PushOperationConstants["pushNumberOpcodes"] = 16] = "pushNumberOpcodes";
        PushOperationConstants[PushOperationConstants["negativeOne"] = 129] = "negativeOne";
        PushOperationConstants[PushOperationConstants["OP_1NEGATE"] = 79] = "OP_1NEGATE";
        /**
         * 256 - 1
         */
        PushOperationConstants[PushOperationConstants["maximumPushData1Size"] = 255] = "maximumPushData1Size";
        /**
         * Standard consensus parameter for most Bitcoin forks.
         */
        PushOperationConstants[PushOperationConstants["maximumPushSize"] = 520] = "maximumPushSize";
        /**
         * 256 ** 2 - 1
         */
        PushOperationConstants[PushOperationConstants["maximumPushData2Size"] = 65535] = "maximumPushData2Size";
        /**
         * 256 ** 4 - 1
         */
        PushOperationConstants[PushOperationConstants["maximumPushData4Size"] = 4294967295] = "maximumPushData4Size";
    })(PushOperationConstants || (PushOperationConstants = {}));
    /**
     * Returns the minimal bytecode required to push the provided `data` to the
     * stack.
     *
     * @remarks
     * This method conservatively encodes a `Uint8Array` as a data push. For Script
     * Numbers which can be pushed using a single opcode (-1 through 16), the
     * equivalent bytecode value is returned. Other `data` values will be prefixed
     * with the proper opcode and push length bytes (if necessary) to create the
     * minimal push instruction.
     *
     * Note, while some single-byte Script Number pushes will be minimally-encoded
     * by this method, all larger inputs will be encoded as-is (it cannot be assumed
     * that inputs are intended to be used as Script Numbers). To encode the push of
     * a Script Number, minimally-encode the number before passing it to this
     * method, e.g.:
     * `encodeDataPush(bigIntToScriptNumber(parseBytesAsScriptNumber(nonMinimalNumber)))`.
     *
     * The maximum `bytecode` length which can be encoded for a push in the Bitcoin
     * system is `4294967295` (~4GB). This method assumes a smaller input – if
     * `bytecode` has the potential to be longer, it should be checked (and the
     * error handled) prior to calling this method.
     *
     * @param data - the Uint8Array to push to the stack
     */
    // eslint-disable-next-line complexity
    const encodeDataPush = (data) => data.length <= PushOperationConstants.maximumPushByteOperationSize
        ? data.length === 0
            ? Uint8Array.of(0)
            : data.length === 1
                ? data[0] !== 0 && data[0] <= PushOperationConstants.pushNumberOpcodes
                    ? Uint8Array.of(data[0] + PushOperationConstants.pushNumberOpcodesOffset)
                    : data[0] === PushOperationConstants.negativeOne
                        ? Uint8Array.of(PushOperationConstants.OP_1NEGATE)
                        : Uint8Array.from([1, ...data])
                : Uint8Array.from([data.length, ...data])
        : data.length <= PushOperationConstants.maximumPushData1Size
            ? Uint8Array.from([
                PushOperationConstants.OP_PUSHDATA_1,
                data.length,
                ...data,
            ])
            : data.length <= PushOperationConstants.maximumPushData2Size
                ? Uint8Array.from([
                    PushOperationConstants.OP_PUSHDATA_2,
                    ...numberToBinUint16LE(data.length),
                    ...data,
                ])
                : Uint8Array.from([
                    PushOperationConstants.OP_PUSHDATA_4,
                    ...numberToBinUint32LE(data.length),
                    ...data,
                ]);
    [
        OpcodesCommon.OP_PUSHBYTES_1,
        OpcodesCommon.OP_PUSHBYTES_2,
        OpcodesCommon.OP_PUSHBYTES_3,
        OpcodesCommon.OP_PUSHBYTES_4,
        OpcodesCommon.OP_PUSHBYTES_5,
        OpcodesCommon.OP_PUSHBYTES_6,
        OpcodesCommon.OP_PUSHBYTES_7,
        OpcodesCommon.OP_PUSHBYTES_8,
        OpcodesCommon.OP_PUSHBYTES_9,
        OpcodesCommon.OP_PUSHBYTES_10,
        OpcodesCommon.OP_PUSHBYTES_11,
        OpcodesCommon.OP_PUSHBYTES_12,
        OpcodesCommon.OP_PUSHBYTES_13,
        OpcodesCommon.OP_PUSHBYTES_14,
        OpcodesCommon.OP_PUSHBYTES_15,
        OpcodesCommon.OP_PUSHBYTES_16,
        OpcodesCommon.OP_PUSHBYTES_17,
        OpcodesCommon.OP_PUSHBYTES_18,
        OpcodesCommon.OP_PUSHBYTES_19,
        OpcodesCommon.OP_PUSHBYTES_20,
        OpcodesCommon.OP_PUSHBYTES_21,
        OpcodesCommon.OP_PUSHBYTES_22,
        OpcodesCommon.OP_PUSHBYTES_23,
        OpcodesCommon.OP_PUSHBYTES_24,
        OpcodesCommon.OP_PUSHBYTES_25,
        OpcodesCommon.OP_PUSHBYTES_26,
        OpcodesCommon.OP_PUSHBYTES_27,
        OpcodesCommon.OP_PUSHBYTES_28,
        OpcodesCommon.OP_PUSHBYTES_29,
        OpcodesCommon.OP_PUSHBYTES_30,
        OpcodesCommon.OP_PUSHBYTES_31,
        OpcodesCommon.OP_PUSHBYTES_32,
        OpcodesCommon.OP_PUSHBYTES_33,
        OpcodesCommon.OP_PUSHBYTES_34,
        OpcodesCommon.OP_PUSHBYTES_35,
        OpcodesCommon.OP_PUSHBYTES_36,
        OpcodesCommon.OP_PUSHBYTES_37,
        OpcodesCommon.OP_PUSHBYTES_38,
        OpcodesCommon.OP_PUSHBYTES_39,
        OpcodesCommon.OP_PUSHBYTES_40,
        OpcodesCommon.OP_PUSHBYTES_41,
        OpcodesCommon.OP_PUSHBYTES_42,
        OpcodesCommon.OP_PUSHBYTES_43,
        OpcodesCommon.OP_PUSHBYTES_44,
        OpcodesCommon.OP_PUSHBYTES_45,
        OpcodesCommon.OP_PUSHBYTES_46,
        OpcodesCommon.OP_PUSHBYTES_47,
        OpcodesCommon.OP_PUSHBYTES_48,
        OpcodesCommon.OP_PUSHBYTES_49,
        OpcodesCommon.OP_PUSHBYTES_50,
        OpcodesCommon.OP_PUSHBYTES_51,
        OpcodesCommon.OP_PUSHBYTES_52,
        OpcodesCommon.OP_PUSHBYTES_53,
        OpcodesCommon.OP_PUSHBYTES_54,
        OpcodesCommon.OP_PUSHBYTES_55,
        OpcodesCommon.OP_PUSHBYTES_56,
        OpcodesCommon.OP_PUSHBYTES_57,
        OpcodesCommon.OP_PUSHBYTES_58,
        OpcodesCommon.OP_PUSHBYTES_59,
        OpcodesCommon.OP_PUSHBYTES_60,
        OpcodesCommon.OP_PUSHBYTES_61,
        OpcodesCommon.OP_PUSHBYTES_62,
        OpcodesCommon.OP_PUSHBYTES_63,
        OpcodesCommon.OP_PUSHBYTES_64,
        OpcodesCommon.OP_PUSHBYTES_65,
        OpcodesCommon.OP_PUSHBYTES_66,
        OpcodesCommon.OP_PUSHBYTES_67,
        OpcodesCommon.OP_PUSHBYTES_68,
        OpcodesCommon.OP_PUSHBYTES_69,
        OpcodesCommon.OP_PUSHBYTES_70,
        OpcodesCommon.OP_PUSHBYTES_71,
        OpcodesCommon.OP_PUSHBYTES_72,
        OpcodesCommon.OP_PUSHBYTES_73,
        OpcodesCommon.OP_PUSHBYTES_74,
        OpcodesCommon.OP_PUSHBYTES_75,
    ];
    [
        OpcodesCommon.OP_1NEGATE,
        OpcodesCommon.OP_1,
        OpcodesCommon.OP_2,
        OpcodesCommon.OP_3,
        OpcodesCommon.OP_4,
        OpcodesCommon.OP_5,
        OpcodesCommon.OP_6,
        OpcodesCommon.OP_7,
        OpcodesCommon.OP_8,
        OpcodesCommon.OP_9,
        OpcodesCommon.OP_10,
        OpcodesCommon.OP_11,
        OpcodesCommon.OP_12,
        OpcodesCommon.OP_13,
        OpcodesCommon.OP_14,
        OpcodesCommon.OP_15,
        OpcodesCommon.OP_16,
    ];

    var ConsensusCommon;
    (function (ConsensusCommon) {
        /**
         * A.K.A. `MAX_SCRIPT_ELEMENT_SIZE`
         */
        ConsensusCommon[ConsensusCommon["maximumStackItemLength"] = 520] = "maximumStackItemLength";
        ConsensusCommon[ConsensusCommon["maximumScriptNumberLength"] = 4] = "maximumScriptNumberLength";
        /**
         * A.K.A. `MAX_OPS_PER_SCRIPT`
         */
        ConsensusCommon[ConsensusCommon["maximumOperationCount"] = 201] = "maximumOperationCount";
        /**
         * A.K.A. `MAX_SCRIPT_SIZE`
         */
        ConsensusCommon[ConsensusCommon["maximumBytecodeLength"] = 10000] = "maximumBytecodeLength";
        /**
         * A.K.A. `MAX_STACK_SIZE`
         */
        ConsensusCommon[ConsensusCommon["maximumStackDepth"] = 1000] = "maximumStackDepth";
    })(ConsensusCommon || (ConsensusCommon = {}));
    const createTransactionContextCommon = (program) => ({
        correspondingOutput: program.inputIndex < program.spendingTransaction.outputs.length
            ? encodeOutput(program.spendingTransaction.outputs[program.inputIndex])
            : undefined,
        locktime: program.spendingTransaction.locktime,
        outpointIndex: program.spendingTransaction.inputs[program.inputIndex].outpointIndex,
        outpointTransactionHash: program.spendingTransaction.inputs[program.inputIndex]
            .outpointTransactionHash,
        outputValue: program.sourceOutput.satoshis,
        sequenceNumber: program.spendingTransaction.inputs[program.inputIndex].sequenceNumber,
        transactionOutpoints: encodeOutpoints(program.spendingTransaction.inputs),
        transactionOutputs: encodeOutputsForSigning(program.spendingTransaction.outputs),
        transactionSequenceNumbers: encodeSequenceNumbersForSigning(program.spendingTransaction.inputs),
        version: program.spendingTransaction.version,
    });

    var OpcodesBCH;
    (function (OpcodesBCH) {
        /**
         * A.K.A. `OP_FALSE` or `OP_PUSHBYTES_0`
         */
        OpcodesBCH[OpcodesBCH["OP_0"] = 0] = "OP_0";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_1"] = 1] = "OP_PUSHBYTES_1";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_2"] = 2] = "OP_PUSHBYTES_2";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_3"] = 3] = "OP_PUSHBYTES_3";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_4"] = 4] = "OP_PUSHBYTES_4";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_5"] = 5] = "OP_PUSHBYTES_5";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_6"] = 6] = "OP_PUSHBYTES_6";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_7"] = 7] = "OP_PUSHBYTES_7";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_8"] = 8] = "OP_PUSHBYTES_8";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_9"] = 9] = "OP_PUSHBYTES_9";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_10"] = 10] = "OP_PUSHBYTES_10";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_11"] = 11] = "OP_PUSHBYTES_11";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_12"] = 12] = "OP_PUSHBYTES_12";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_13"] = 13] = "OP_PUSHBYTES_13";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_14"] = 14] = "OP_PUSHBYTES_14";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_15"] = 15] = "OP_PUSHBYTES_15";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_16"] = 16] = "OP_PUSHBYTES_16";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_17"] = 17] = "OP_PUSHBYTES_17";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_18"] = 18] = "OP_PUSHBYTES_18";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_19"] = 19] = "OP_PUSHBYTES_19";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_20"] = 20] = "OP_PUSHBYTES_20";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_21"] = 21] = "OP_PUSHBYTES_21";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_22"] = 22] = "OP_PUSHBYTES_22";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_23"] = 23] = "OP_PUSHBYTES_23";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_24"] = 24] = "OP_PUSHBYTES_24";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_25"] = 25] = "OP_PUSHBYTES_25";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_26"] = 26] = "OP_PUSHBYTES_26";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_27"] = 27] = "OP_PUSHBYTES_27";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_28"] = 28] = "OP_PUSHBYTES_28";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_29"] = 29] = "OP_PUSHBYTES_29";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_30"] = 30] = "OP_PUSHBYTES_30";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_31"] = 31] = "OP_PUSHBYTES_31";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_32"] = 32] = "OP_PUSHBYTES_32";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_33"] = 33] = "OP_PUSHBYTES_33";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_34"] = 34] = "OP_PUSHBYTES_34";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_35"] = 35] = "OP_PUSHBYTES_35";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_36"] = 36] = "OP_PUSHBYTES_36";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_37"] = 37] = "OP_PUSHBYTES_37";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_38"] = 38] = "OP_PUSHBYTES_38";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_39"] = 39] = "OP_PUSHBYTES_39";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_40"] = 40] = "OP_PUSHBYTES_40";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_41"] = 41] = "OP_PUSHBYTES_41";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_42"] = 42] = "OP_PUSHBYTES_42";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_43"] = 43] = "OP_PUSHBYTES_43";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_44"] = 44] = "OP_PUSHBYTES_44";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_45"] = 45] = "OP_PUSHBYTES_45";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_46"] = 46] = "OP_PUSHBYTES_46";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_47"] = 47] = "OP_PUSHBYTES_47";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_48"] = 48] = "OP_PUSHBYTES_48";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_49"] = 49] = "OP_PUSHBYTES_49";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_50"] = 50] = "OP_PUSHBYTES_50";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_51"] = 51] = "OP_PUSHBYTES_51";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_52"] = 52] = "OP_PUSHBYTES_52";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_53"] = 53] = "OP_PUSHBYTES_53";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_54"] = 54] = "OP_PUSHBYTES_54";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_55"] = 55] = "OP_PUSHBYTES_55";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_56"] = 56] = "OP_PUSHBYTES_56";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_57"] = 57] = "OP_PUSHBYTES_57";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_58"] = 58] = "OP_PUSHBYTES_58";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_59"] = 59] = "OP_PUSHBYTES_59";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_60"] = 60] = "OP_PUSHBYTES_60";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_61"] = 61] = "OP_PUSHBYTES_61";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_62"] = 62] = "OP_PUSHBYTES_62";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_63"] = 63] = "OP_PUSHBYTES_63";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_64"] = 64] = "OP_PUSHBYTES_64";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_65"] = 65] = "OP_PUSHBYTES_65";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_66"] = 66] = "OP_PUSHBYTES_66";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_67"] = 67] = "OP_PUSHBYTES_67";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_68"] = 68] = "OP_PUSHBYTES_68";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_69"] = 69] = "OP_PUSHBYTES_69";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_70"] = 70] = "OP_PUSHBYTES_70";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_71"] = 71] = "OP_PUSHBYTES_71";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_72"] = 72] = "OP_PUSHBYTES_72";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_73"] = 73] = "OP_PUSHBYTES_73";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_74"] = 74] = "OP_PUSHBYTES_74";
        OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_75"] = 75] = "OP_PUSHBYTES_75";
        OpcodesBCH[OpcodesBCH["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
        OpcodesBCH[OpcodesBCH["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
        OpcodesBCH[OpcodesBCH["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
        OpcodesBCH[OpcodesBCH["OP_1NEGATE"] = 79] = "OP_1NEGATE";
        OpcodesBCH[OpcodesBCH["OP_RESERVED"] = 80] = "OP_RESERVED";
        /**
         * A.K.A. `OP_TRUE`
         */
        OpcodesBCH[OpcodesBCH["OP_1"] = 81] = "OP_1";
        OpcodesBCH[OpcodesBCH["OP_2"] = 82] = "OP_2";
        OpcodesBCH[OpcodesBCH["OP_3"] = 83] = "OP_3";
        OpcodesBCH[OpcodesBCH["OP_4"] = 84] = "OP_4";
        OpcodesBCH[OpcodesBCH["OP_5"] = 85] = "OP_5";
        OpcodesBCH[OpcodesBCH["OP_6"] = 86] = "OP_6";
        OpcodesBCH[OpcodesBCH["OP_7"] = 87] = "OP_7";
        OpcodesBCH[OpcodesBCH["OP_8"] = 88] = "OP_8";
        OpcodesBCH[OpcodesBCH["OP_9"] = 89] = "OP_9";
        OpcodesBCH[OpcodesBCH["OP_10"] = 90] = "OP_10";
        OpcodesBCH[OpcodesBCH["OP_11"] = 91] = "OP_11";
        OpcodesBCH[OpcodesBCH["OP_12"] = 92] = "OP_12";
        OpcodesBCH[OpcodesBCH["OP_13"] = 93] = "OP_13";
        OpcodesBCH[OpcodesBCH["OP_14"] = 94] = "OP_14";
        OpcodesBCH[OpcodesBCH["OP_15"] = 95] = "OP_15";
        OpcodesBCH[OpcodesBCH["OP_16"] = 96] = "OP_16";
        OpcodesBCH[OpcodesBCH["OP_NOP"] = 97] = "OP_NOP";
        OpcodesBCH[OpcodesBCH["OP_VER"] = 98] = "OP_VER";
        OpcodesBCH[OpcodesBCH["OP_IF"] = 99] = "OP_IF";
        OpcodesBCH[OpcodesBCH["OP_NOTIF"] = 100] = "OP_NOTIF";
        OpcodesBCH[OpcodesBCH["OP_VERIF"] = 101] = "OP_VERIF";
        OpcodesBCH[OpcodesBCH["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
        OpcodesBCH[OpcodesBCH["OP_ELSE"] = 103] = "OP_ELSE";
        OpcodesBCH[OpcodesBCH["OP_ENDIF"] = 104] = "OP_ENDIF";
        OpcodesBCH[OpcodesBCH["OP_VERIFY"] = 105] = "OP_VERIFY";
        OpcodesBCH[OpcodesBCH["OP_RETURN"] = 106] = "OP_RETURN";
        OpcodesBCH[OpcodesBCH["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
        OpcodesBCH[OpcodesBCH["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
        OpcodesBCH[OpcodesBCH["OP_2DROP"] = 109] = "OP_2DROP";
        OpcodesBCH[OpcodesBCH["OP_2DUP"] = 110] = "OP_2DUP";
        OpcodesBCH[OpcodesBCH["OP_3DUP"] = 111] = "OP_3DUP";
        OpcodesBCH[OpcodesBCH["OP_2OVER"] = 112] = "OP_2OVER";
        OpcodesBCH[OpcodesBCH["OP_2ROT"] = 113] = "OP_2ROT";
        OpcodesBCH[OpcodesBCH["OP_2SWAP"] = 114] = "OP_2SWAP";
        OpcodesBCH[OpcodesBCH["OP_IFDUP"] = 115] = "OP_IFDUP";
        OpcodesBCH[OpcodesBCH["OP_DEPTH"] = 116] = "OP_DEPTH";
        OpcodesBCH[OpcodesBCH["OP_DROP"] = 117] = "OP_DROP";
        OpcodesBCH[OpcodesBCH["OP_DUP"] = 118] = "OP_DUP";
        OpcodesBCH[OpcodesBCH["OP_NIP"] = 119] = "OP_NIP";
        OpcodesBCH[OpcodesBCH["OP_OVER"] = 120] = "OP_OVER";
        OpcodesBCH[OpcodesBCH["OP_PICK"] = 121] = "OP_PICK";
        OpcodesBCH[OpcodesBCH["OP_ROLL"] = 122] = "OP_ROLL";
        OpcodesBCH[OpcodesBCH["OP_ROT"] = 123] = "OP_ROT";
        OpcodesBCH[OpcodesBCH["OP_SWAP"] = 124] = "OP_SWAP";
        OpcodesBCH[OpcodesBCH["OP_TUCK"] = 125] = "OP_TUCK";
        OpcodesBCH[OpcodesBCH["OP_CAT"] = 126] = "OP_CAT";
        OpcodesBCH[OpcodesBCH["OP_SPLIT"] = 127] = "OP_SPLIT";
        OpcodesBCH[OpcodesBCH["OP_NUM2BIN"] = 128] = "OP_NUM2BIN";
        OpcodesBCH[OpcodesBCH["OP_BIN2NUM"] = 129] = "OP_BIN2NUM";
        OpcodesBCH[OpcodesBCH["OP_SIZE"] = 130] = "OP_SIZE";
        OpcodesBCH[OpcodesBCH["OP_INVERT"] = 131] = "OP_INVERT";
        OpcodesBCH[OpcodesBCH["OP_AND"] = 132] = "OP_AND";
        OpcodesBCH[OpcodesBCH["OP_OR"] = 133] = "OP_OR";
        OpcodesBCH[OpcodesBCH["OP_XOR"] = 134] = "OP_XOR";
        OpcodesBCH[OpcodesBCH["OP_EQUAL"] = 135] = "OP_EQUAL";
        OpcodesBCH[OpcodesBCH["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
        OpcodesBCH[OpcodesBCH["OP_RESERVED1"] = 137] = "OP_RESERVED1";
        OpcodesBCH[OpcodesBCH["OP_RESERVED2"] = 138] = "OP_RESERVED2";
        OpcodesBCH[OpcodesBCH["OP_1ADD"] = 139] = "OP_1ADD";
        OpcodesBCH[OpcodesBCH["OP_1SUB"] = 140] = "OP_1SUB";
        OpcodesBCH[OpcodesBCH["OP_2MUL"] = 141] = "OP_2MUL";
        OpcodesBCH[OpcodesBCH["OP_2DIV"] = 142] = "OP_2DIV";
        OpcodesBCH[OpcodesBCH["OP_NEGATE"] = 143] = "OP_NEGATE";
        OpcodesBCH[OpcodesBCH["OP_ABS"] = 144] = "OP_ABS";
        OpcodesBCH[OpcodesBCH["OP_NOT"] = 145] = "OP_NOT";
        OpcodesBCH[OpcodesBCH["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
        OpcodesBCH[OpcodesBCH["OP_ADD"] = 147] = "OP_ADD";
        OpcodesBCH[OpcodesBCH["OP_SUB"] = 148] = "OP_SUB";
        OpcodesBCH[OpcodesBCH["OP_MUL"] = 149] = "OP_MUL";
        OpcodesBCH[OpcodesBCH["OP_DIV"] = 150] = "OP_DIV";
        OpcodesBCH[OpcodesBCH["OP_MOD"] = 151] = "OP_MOD";
        OpcodesBCH[OpcodesBCH["OP_LSHIFT"] = 152] = "OP_LSHIFT";
        OpcodesBCH[OpcodesBCH["OP_RSHIFT"] = 153] = "OP_RSHIFT";
        OpcodesBCH[OpcodesBCH["OP_BOOLAND"] = 154] = "OP_BOOLAND";
        OpcodesBCH[OpcodesBCH["OP_BOOLOR"] = 155] = "OP_BOOLOR";
        OpcodesBCH[OpcodesBCH["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
        OpcodesBCH[OpcodesBCH["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
        OpcodesBCH[OpcodesBCH["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
        OpcodesBCH[OpcodesBCH["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
        OpcodesBCH[OpcodesBCH["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
        OpcodesBCH[OpcodesBCH["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
        OpcodesBCH[OpcodesBCH["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
        OpcodesBCH[OpcodesBCH["OP_MIN"] = 163] = "OP_MIN";
        OpcodesBCH[OpcodesBCH["OP_MAX"] = 164] = "OP_MAX";
        OpcodesBCH[OpcodesBCH["OP_WITHIN"] = 165] = "OP_WITHIN";
        OpcodesBCH[OpcodesBCH["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
        OpcodesBCH[OpcodesBCH["OP_SHA1"] = 167] = "OP_SHA1";
        OpcodesBCH[OpcodesBCH["OP_SHA256"] = 168] = "OP_SHA256";
        OpcodesBCH[OpcodesBCH["OP_HASH160"] = 169] = "OP_HASH160";
        OpcodesBCH[OpcodesBCH["OP_HASH256"] = 170] = "OP_HASH256";
        OpcodesBCH[OpcodesBCH["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
        OpcodesBCH[OpcodesBCH["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
        OpcodesBCH[OpcodesBCH["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
        OpcodesBCH[OpcodesBCH["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
        OpcodesBCH[OpcodesBCH["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
        OpcodesBCH[OpcodesBCH["OP_NOP1"] = 176] = "OP_NOP1";
        /**
         * Previously `OP_NOP2`
         */
        OpcodesBCH[OpcodesBCH["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
        /**
         * Previously `OP_NOP2`
         */
        OpcodesBCH[OpcodesBCH["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
        OpcodesBCH[OpcodesBCH["OP_NOP4"] = 179] = "OP_NOP4";
        OpcodesBCH[OpcodesBCH["OP_NOP5"] = 180] = "OP_NOP5";
        OpcodesBCH[OpcodesBCH["OP_NOP6"] = 181] = "OP_NOP6";
        OpcodesBCH[OpcodesBCH["OP_NOP7"] = 182] = "OP_NOP7";
        OpcodesBCH[OpcodesBCH["OP_NOP8"] = 183] = "OP_NOP8";
        OpcodesBCH[OpcodesBCH["OP_NOP9"] = 184] = "OP_NOP9";
        OpcodesBCH[OpcodesBCH["OP_NOP10"] = 185] = "OP_NOP10";
        /**
         * Previously `OP_UNKNOWN186`
         */
        OpcodesBCH[OpcodesBCH["OP_CHECKDATASIG"] = 186] = "OP_CHECKDATASIG";
        /**
         * Previously `OP_UNKNOWN187`
         */
        OpcodesBCH[OpcodesBCH["OP_CHECKDATASIGVERIFY"] = 187] = "OP_CHECKDATASIGVERIFY";
        /**
         * Previously `OP_UNKNOWN188`
         */
        OpcodesBCH[OpcodesBCH["OP_REVERSEBYTES"] = 188] = "OP_REVERSEBYTES";
        /**
         * A.K.A. `FIRST_UNDEFINED_OP_VALUE`
         */
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN189"] = 189] = "OP_UNKNOWN189";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN190"] = 190] = "OP_UNKNOWN190";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN191"] = 191] = "OP_UNKNOWN191";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN192"] = 192] = "OP_UNKNOWN192";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN193"] = 193] = "OP_UNKNOWN193";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN194"] = 194] = "OP_UNKNOWN194";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN195"] = 195] = "OP_UNKNOWN195";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN196"] = 196] = "OP_UNKNOWN196";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN197"] = 197] = "OP_UNKNOWN197";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN198"] = 198] = "OP_UNKNOWN198";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN199"] = 199] = "OP_UNKNOWN199";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN200"] = 200] = "OP_UNKNOWN200";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN201"] = 201] = "OP_UNKNOWN201";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN202"] = 202] = "OP_UNKNOWN202";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN203"] = 203] = "OP_UNKNOWN203";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN204"] = 204] = "OP_UNKNOWN204";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN205"] = 205] = "OP_UNKNOWN205";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN206"] = 206] = "OP_UNKNOWN206";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN207"] = 207] = "OP_UNKNOWN207";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN208"] = 208] = "OP_UNKNOWN208";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN209"] = 209] = "OP_UNKNOWN209";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN210"] = 210] = "OP_UNKNOWN210";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN211"] = 211] = "OP_UNKNOWN211";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN212"] = 212] = "OP_UNKNOWN212";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN213"] = 213] = "OP_UNKNOWN213";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN214"] = 214] = "OP_UNKNOWN214";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN215"] = 215] = "OP_UNKNOWN215";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN216"] = 216] = "OP_UNKNOWN216";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN217"] = 217] = "OP_UNKNOWN217";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN218"] = 218] = "OP_UNKNOWN218";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN219"] = 219] = "OP_UNKNOWN219";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN220"] = 220] = "OP_UNKNOWN220";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN221"] = 221] = "OP_UNKNOWN221";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN222"] = 222] = "OP_UNKNOWN222";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN223"] = 223] = "OP_UNKNOWN223";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN224"] = 224] = "OP_UNKNOWN224";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN225"] = 225] = "OP_UNKNOWN225";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN226"] = 226] = "OP_UNKNOWN226";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN227"] = 227] = "OP_UNKNOWN227";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN228"] = 228] = "OP_UNKNOWN228";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN229"] = 229] = "OP_UNKNOWN229";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN230"] = 230] = "OP_UNKNOWN230";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN231"] = 231] = "OP_UNKNOWN231";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN232"] = 232] = "OP_UNKNOWN232";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN233"] = 233] = "OP_UNKNOWN233";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN234"] = 234] = "OP_UNKNOWN234";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN235"] = 235] = "OP_UNKNOWN235";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN236"] = 236] = "OP_UNKNOWN236";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN237"] = 237] = "OP_UNKNOWN237";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN238"] = 238] = "OP_UNKNOWN238";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN239"] = 239] = "OP_UNKNOWN239";
        /**
         * A.K.A. `OP_PREFIX_BEGIN`
         */
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN240"] = 240] = "OP_UNKNOWN240";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN241"] = 241] = "OP_UNKNOWN241";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN242"] = 242] = "OP_UNKNOWN242";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN243"] = 243] = "OP_UNKNOWN243";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN244"] = 244] = "OP_UNKNOWN244";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN245"] = 245] = "OP_UNKNOWN245";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN246"] = 246] = "OP_UNKNOWN246";
        /**
         * A.K.A. `OP_PREFIX_END`
         */
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN247"] = 247] = "OP_UNKNOWN247";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN248"] = 248] = "OP_UNKNOWN248";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN249"] = 249] = "OP_UNKNOWN249";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN250"] = 250] = "OP_UNKNOWN250";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN251"] = 251] = "OP_UNKNOWN251";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN252"] = 252] = "OP_UNKNOWN252";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN253"] = 253] = "OP_UNKNOWN253";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN254"] = 254] = "OP_UNKNOWN254";
        OpcodesBCH[OpcodesBCH["OP_UNKNOWN255"] = 255] = "OP_UNKNOWN255";
    })(OpcodesBCH || (OpcodesBCH = {}));
    var OpcodeAlternateNamesBCH;
    (function (OpcodeAlternateNamesBCH) {
        /**
         * A.K.A. `OP_0`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_FALSE"] = 0] = "OP_FALSE";
        /**
         * A.K.A. `OP_0`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUSHBYTES_0"] = 0] = "OP_PUSHBYTES_0";
        /**
         * A.K.A. `OP_1`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_TRUE"] = 81] = "OP_TRUE";
        /**
         * A.K.A. `OP_CHECKLOCKTIMEVERIFY`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_NOP2"] = 177] = "OP_NOP2";
        /**
         * A.K.A. `OP_CHECKSEQUENCEVERIFY`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_NOP3"] = 178] = "OP_NOP3";
        /**
         * A.K.A. `OP_CHECKDATASIG`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_UNKNOWN186"] = 186] = "OP_UNKNOWN186";
        /**
         * A.K.A. `OP_CHECKDATASIGVERIFY`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_UNKNOWN187"] = 187] = "OP_UNKNOWN187";
        /**
         * A.K.A. `OP_UNKNOWN189`
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["FIRST_UNDEFINED_OP_VALUE"] = 189] = "FIRST_UNDEFINED_OP_VALUE";
        /**
         * A.K.A. `OP_UNKNOWN240`. Some implementations have reserved opcodes
         * `0xf0` through `0xf7` for a future range of multi-byte opcodes, though none
         * are yet available on the network.
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PREFIX_BEGIN"] = 240] = "OP_PREFIX_BEGIN";
        /**
         * A.K.A. `OP_UNKNOWN247`. Some implementations have reserved opcodes
         * `0xf0` through `0xf7` for a future range of multi-byte opcodes, though none
         * are yet available on the network.
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PREFIX_END"] = 247] = "OP_PREFIX_END";
        /**
         * `OP_SMALLINTEGER` is used internally for template matching in the C++
         * implementation. When found on the network, it is `OP_UNKNOWN250`.
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_SMALLINTEGER"] = 250] = "OP_SMALLINTEGER";
        /**
         * `OP_PUBKEYS` is used internally for template matching in the C++
         * implementation. When found on the network, it is `OP_UNKNOWN251`.
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUBKEYS"] = 251] = "OP_PUBKEYS";
        /**
         * `OP_PUBKEYHASH` is used internally for template matching in the C++
         * implementation. When found on the network, it is `OP_UNKNOWN253`.
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUBKEYHASH"] = 253] = "OP_PUBKEYHASH";
        /**
         * `OP_PUBKEY` is used internally for template matching in the C++
         * implementation. When found on the network, it is `OP_UNKNOWN254`.
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUBKEY"] = 254] = "OP_PUBKEY";
        /**
         * `OP_INVALIDOPCODE` is described as such for testing in the C++
         * implementation. When found on the network, it is `OP_UNKNOWN255`.
         */
        OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_INVALIDOPCODE"] = 255] = "OP_INVALIDOPCODE";
    })(OpcodeAlternateNamesBCH || (OpcodeAlternateNamesBCH = {}));

    var WalletImportFormatError;
    (function (WalletImportFormatError) {
        WalletImportFormatError["incorrectLength"] = "The WIF private key payload is not the correct length.";
    })(WalletImportFormatError || (WalletImportFormatError = {}));
    /**
     * Decode a private key using Wallet Import Format (WIF). See
     * `encodePrivateKeyWif` for details.
     *
     * @param sha256 - an implementation of sha256 (a universal implementation is
     * available via `instantiateSha256`)
     * @param wifKey - the private key to decode (in Wallet Import Format)
     */
    // eslint-disable-next-line complexity
    const decodePrivateKeyWif = (sha256, wifKey) => {
        const compressedPayloadLength = 33;
        const decoded = decodeBase58AddressFormat(sha256, wifKey);
        if (typeof decoded === 'string')
            return decoded;
        const mainnet = decoded.version === Base58AddressFormatVersion.wif;
        const compressed = decoded.payload.length === compressedPayloadLength;
        const privateKey = compressed
            ? decoded.payload.slice(0, -1)
            : decoded.payload;
        const type = mainnet
            ? compressed
                ? 'mainnet'
                : 'mainnet-uncompressed'
            : compressed
                ? 'testnet'
                : 'testnet-uncompressed';
        return { privateKey, type };
    };

    const DELIMITER = ",";
    const DefaultOptions = {
        version: 1,
        network: "mainnet"
    };
    // '62616e6b'
    const PROTOCOL_ID = '7574786f';
    const _PROTOCOL_ID = '0x' + PROTOCOL_ID;

    function encodeBool(bool) {
        return bool ? encodeInt(1) : encodeInt(0);
    }
    function encodeInt(int) {
        return bigIntToScriptNumber(BigInt(int));
    }
    function decodeInt(encodedInt, maxLength = 8) {
        const options = { maximumScriptNumberByteLength: maxLength };
        const result = parseBytesAsScriptNumber(encodedInt, options);
        if (isScriptNumberError(result)) {
            throw new Error(result);
        }
        return Number(result);
    }
    function encodeString(str) {
        return utf8ToBin(str);
    }
    function placeholder(size) {
        return new Uint8Array(size).fill(0);
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var minimalisticAssert = assert;

    function assert(val, msg) {
      if (!val)
        throw new Error(msg || 'Assertion failed');
    }

    assert.equal = function assertEqual(l, r, msg) {
      if (l != r)
        throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
    };

    var inherits_browser = createCommonjsModule(function (module) {
    if (typeof Object.create === 'function') {
      // implementation from standard node.js 'util' module
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      // old school shim for old browsers
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function () {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
    });

    var inherits_1 = inherits_browser;

    function isSurrogatePair(msg, i) {
      if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
        return false;
      }
      if (i < 0 || i + 1 >= msg.length) {
        return false;
      }
      return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
    }

    function toArray$1(msg, enc) {
      if (Array.isArray(msg))
        return msg.slice();
      if (!msg)
        return [];
      var res = [];
      if (typeof msg === 'string') {
        if (!enc) {
          // Inspired by stringToUtf8ByteArray() in closure-library by Google
          // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
          // Apache License 2.0
          // https://github.com/google/closure-library/blob/master/LICENSE
          var p = 0;
          for (var i = 0; i < msg.length; i++) {
            var c = msg.charCodeAt(i);
            if (c < 128) {
              res[p++] = c;
            } else if (c < 2048) {
              res[p++] = (c >> 6) | 192;
              res[p++] = (c & 63) | 128;
            } else if (isSurrogatePair(msg, i)) {
              c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
              res[p++] = (c >> 18) | 240;
              res[p++] = ((c >> 12) & 63) | 128;
              res[p++] = ((c >> 6) & 63) | 128;
              res[p++] = (c & 63) | 128;
            } else {
              res[p++] = (c >> 12) | 224;
              res[p++] = ((c >> 6) & 63) | 128;
              res[p++] = (c & 63) | 128;
            }
          }
        } else if (enc === 'hex') {
          msg = msg.replace(/[^a-z0-9]+/ig, '');
          if (msg.length % 2 !== 0)
            msg = '0' + msg;
          for (i = 0; i < msg.length; i += 2)
            res.push(parseInt(msg[i] + msg[i + 1], 16));
        }
      } else {
        for (i = 0; i < msg.length; i++)
          res[i] = msg[i] | 0;
      }
      return res;
    }
    var toArray_1 = toArray$1;

    function toHex$1(msg) {
      var res = '';
      for (var i = 0; i < msg.length; i++)
        res += zero2(msg[i].toString(16));
      return res;
    }
    var toHex_1 = toHex$1;

    function htonl(w) {
      var res = (w >>> 24) |
                ((w >>> 8) & 0xff00) |
                ((w << 8) & 0xff0000) |
                ((w & 0xff) << 24);
      return res >>> 0;
    }
    var htonl_1 = htonl;

    function toHex32(msg, endian) {
      var res = '';
      for (var i = 0; i < msg.length; i++) {
        var w = msg[i];
        if (endian === 'little')
          w = htonl(w);
        res += zero8(w.toString(16));
      }
      return res;
    }
    var toHex32_1 = toHex32;

    function zero2(word) {
      if (word.length === 1)
        return '0' + word;
      else
        return word;
    }
    var zero2_1 = zero2;

    function zero8(word) {
      if (word.length === 7)
        return '0' + word;
      else if (word.length === 6)
        return '00' + word;
      else if (word.length === 5)
        return '000' + word;
      else if (word.length === 4)
        return '0000' + word;
      else if (word.length === 3)
        return '00000' + word;
      else if (word.length === 2)
        return '000000' + word;
      else if (word.length === 1)
        return '0000000' + word;
      else
        return word;
    }
    var zero8_1 = zero8;

    function join32(msg, start, end, endian) {
      var len = end - start;
      minimalisticAssert(len % 4 === 0);
      var res = new Array(len / 4);
      for (var i = 0, k = start; i < res.length; i++, k += 4) {
        var w;
        if (endian === 'big')
          w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
        else
          w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
        res[i] = w >>> 0;
      }
      return res;
    }
    var join32_1 = join32;

    function split32(msg, endian) {
      var res = new Array(msg.length * 4);
      for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
        var m = msg[i];
        if (endian === 'big') {
          res[k] = m >>> 24;
          res[k + 1] = (m >>> 16) & 0xff;
          res[k + 2] = (m >>> 8) & 0xff;
          res[k + 3] = m & 0xff;
        } else {
          res[k + 3] = m >>> 24;
          res[k + 2] = (m >>> 16) & 0xff;
          res[k + 1] = (m >>> 8) & 0xff;
          res[k] = m & 0xff;
        }
      }
      return res;
    }
    var split32_1 = split32;

    function rotr32$1(w, b) {
      return (w >>> b) | (w << (32 - b));
    }
    var rotr32_1 = rotr32$1;

    function rotl32$2(w, b) {
      return (w << b) | (w >>> (32 - b));
    }
    var rotl32_1 = rotl32$2;

    function sum32$3(a, b) {
      return (a + b) >>> 0;
    }
    var sum32_1 = sum32$3;

    function sum32_3$1(a, b, c) {
      return (a + b + c) >>> 0;
    }
    var sum32_3_1 = sum32_3$1;

    function sum32_4$2(a, b, c, d) {
      return (a + b + c + d) >>> 0;
    }
    var sum32_4_1 = sum32_4$2;

    function sum32_5$2(a, b, c, d, e) {
      return (a + b + c + d + e) >>> 0;
    }
    var sum32_5_1 = sum32_5$2;

    function sum64$1(buf, pos, ah, al) {
      var bh = buf[pos];
      var bl = buf[pos + 1];

      var lo = (al + bl) >>> 0;
      var hi = (lo < al ? 1 : 0) + ah + bh;
      buf[pos] = hi >>> 0;
      buf[pos + 1] = lo;
    }
    var sum64_1 = sum64$1;

    function sum64_hi$1(ah, al, bh, bl) {
      var lo = (al + bl) >>> 0;
      var hi = (lo < al ? 1 : 0) + ah + bh;
      return hi >>> 0;
    }
    var sum64_hi_1 = sum64_hi$1;

    function sum64_lo$1(ah, al, bh, bl) {
      var lo = al + bl;
      return lo >>> 0;
    }
    var sum64_lo_1 = sum64_lo$1;

    function sum64_4_hi$1(ah, al, bh, bl, ch, cl, dh, dl) {
      var carry = 0;
      var lo = al;
      lo = (lo + bl) >>> 0;
      carry += lo < al ? 1 : 0;
      lo = (lo + cl) >>> 0;
      carry += lo < cl ? 1 : 0;
      lo = (lo + dl) >>> 0;
      carry += lo < dl ? 1 : 0;

      var hi = ah + bh + ch + dh + carry;
      return hi >>> 0;
    }
    var sum64_4_hi_1 = sum64_4_hi$1;

    function sum64_4_lo$1(ah, al, bh, bl, ch, cl, dh, dl) {
      var lo = al + bl + cl + dl;
      return lo >>> 0;
    }
    var sum64_4_lo_1 = sum64_4_lo$1;

    function sum64_5_hi$1(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
      var carry = 0;
      var lo = al;
      lo = (lo + bl) >>> 0;
      carry += lo < al ? 1 : 0;
      lo = (lo + cl) >>> 0;
      carry += lo < cl ? 1 : 0;
      lo = (lo + dl) >>> 0;
      carry += lo < dl ? 1 : 0;
      lo = (lo + el) >>> 0;
      carry += lo < el ? 1 : 0;

      var hi = ah + bh + ch + dh + eh + carry;
      return hi >>> 0;
    }
    var sum64_5_hi_1 = sum64_5_hi$1;

    function sum64_5_lo$1(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
      var lo = al + bl + cl + dl + el;

      return lo >>> 0;
    }
    var sum64_5_lo_1 = sum64_5_lo$1;

    function rotr64_hi$1(ah, al, num) {
      var r = (al << (32 - num)) | (ah >>> num);
      return r >>> 0;
    }
    var rotr64_hi_1 = rotr64_hi$1;

    function rotr64_lo$1(ah, al, num) {
      var r = (ah << (32 - num)) | (al >>> num);
      return r >>> 0;
    }
    var rotr64_lo_1 = rotr64_lo$1;

    function shr64_hi$1(ah, al, num) {
      return ah >>> num;
    }
    var shr64_hi_1 = shr64_hi$1;

    function shr64_lo$1(ah, al, num) {
      var r = (ah << (32 - num)) | (al >>> num);
      return r >>> 0;
    }
    var shr64_lo_1 = shr64_lo$1;

    var utils$1 = {
    	inherits: inherits_1,
    	toArray: toArray_1,
    	toHex: toHex_1,
    	htonl: htonl_1,
    	toHex32: toHex32_1,
    	zero2: zero2_1,
    	zero8: zero8_1,
    	join32: join32_1,
    	split32: split32_1,
    	rotr32: rotr32_1,
    	rotl32: rotl32_1,
    	sum32: sum32_1,
    	sum32_3: sum32_3_1,
    	sum32_4: sum32_4_1,
    	sum32_5: sum32_5_1,
    	sum64: sum64_1,
    	sum64_hi: sum64_hi_1,
    	sum64_lo: sum64_lo_1,
    	sum64_4_hi: sum64_4_hi_1,
    	sum64_4_lo: sum64_4_lo_1,
    	sum64_5_hi: sum64_5_hi_1,
    	sum64_5_lo: sum64_5_lo_1,
    	rotr64_hi: rotr64_hi_1,
    	rotr64_lo: rotr64_lo_1,
    	shr64_hi: shr64_hi_1,
    	shr64_lo: shr64_lo_1
    };

    function BlockHash$4() {
      this.pending = null;
      this.pendingTotal = 0;
      this.blockSize = this.constructor.blockSize;
      this.outSize = this.constructor.outSize;
      this.hmacStrength = this.constructor.hmacStrength;
      this.padLength = this.constructor.padLength / 8;
      this.endian = 'big';

      this._delta8 = this.blockSize / 8;
      this._delta32 = this.blockSize / 32;
    }
    var BlockHash_1 = BlockHash$4;

    BlockHash$4.prototype.update = function update(msg, enc) {
      // Convert message to array, pad it, and join into 32bit blocks
      msg = utils$1.toArray(msg, enc);
      if (!this.pending)
        this.pending = msg;
      else
        this.pending = this.pending.concat(msg);
      this.pendingTotal += msg.length;

      // Enough data, try updating
      if (this.pending.length >= this._delta8) {
        msg = this.pending;

        // Process pending data in blocks
        var r = msg.length % this._delta8;
        this.pending = msg.slice(msg.length - r, msg.length);
        if (this.pending.length === 0)
          this.pending = null;

        msg = utils$1.join32(msg, 0, msg.length - r, this.endian);
        for (var i = 0; i < msg.length; i += this._delta32)
          this._update(msg, i, i + this._delta32);
      }

      return this;
    };

    BlockHash$4.prototype.digest = function digest(enc) {
      this.update(this._pad());
      minimalisticAssert(this.pending === null);

      return this._digest(enc);
    };

    BlockHash$4.prototype._pad = function pad() {
      var len = this.pendingTotal;
      var bytes = this._delta8;
      var k = bytes - ((len + this.padLength) % bytes);
      var res = new Array(k + this.padLength);
      res[0] = 0x80;
      for (var i = 1; i < k; i++)
        res[i] = 0;

      // Append length
      len <<= 3;
      if (this.endian === 'big') {
        for (var t = 8; t < this.padLength; t++)
          res[i++] = 0;

        res[i++] = 0;
        res[i++] = 0;
        res[i++] = 0;
        res[i++] = 0;
        res[i++] = (len >>> 24) & 0xff;
        res[i++] = (len >>> 16) & 0xff;
        res[i++] = (len >>> 8) & 0xff;
        res[i++] = len & 0xff;
      } else {
        res[i++] = len & 0xff;
        res[i++] = (len >>> 8) & 0xff;
        res[i++] = (len >>> 16) & 0xff;
        res[i++] = (len >>> 24) & 0xff;
        res[i++] = 0;
        res[i++] = 0;
        res[i++] = 0;
        res[i++] = 0;

        for (t = 8; t < this.padLength; t++)
          res[i++] = 0;
      }

      return res;
    };

    var common$2 = {
    	BlockHash: BlockHash_1
    };

    var rotr32 = utils$1.rotr32;

    function ft_1$1(s, x, y, z) {
      if (s === 0)
        return ch32$1(x, y, z);
      if (s === 1 || s === 3)
        return p32(x, y, z);
      if (s === 2)
        return maj32$1(x, y, z);
    }
    var ft_1_1 = ft_1$1;

    function ch32$1(x, y, z) {
      return (x & y) ^ ((~x) & z);
    }
    var ch32_1 = ch32$1;

    function maj32$1(x, y, z) {
      return (x & y) ^ (x & z) ^ (y & z);
    }
    var maj32_1 = maj32$1;

    function p32(x, y, z) {
      return x ^ y ^ z;
    }
    var p32_1 = p32;

    function s0_256$1(x) {
      return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
    }
    var s0_256_1 = s0_256$1;

    function s1_256$1(x) {
      return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
    }
    var s1_256_1 = s1_256$1;

    function g0_256$1(x) {
      return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
    }
    var g0_256_1 = g0_256$1;

    function g1_256$1(x) {
      return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
    }
    var g1_256_1 = g1_256$1;

    var common$1 = {
    	ft_1: ft_1_1,
    	ch32: ch32_1,
    	maj32: maj32_1,
    	p32: p32_1,
    	s0_256: s0_256_1,
    	s1_256: s1_256_1,
    	g0_256: g0_256_1,
    	g1_256: g1_256_1
    };

    var rotl32$1 = utils$1.rotl32;
    var sum32$2 = utils$1.sum32;
    var sum32_5$1 = utils$1.sum32_5;
    var ft_1 = common$1.ft_1;
    var BlockHash$3 = common$2.BlockHash;

    var sha1_K = [
      0x5A827999, 0x6ED9EBA1,
      0x8F1BBCDC, 0xCA62C1D6
    ];

    function SHA1() {
      if (!(this instanceof SHA1))
        return new SHA1();

      BlockHash$3.call(this);
      this.h = [
        0x67452301, 0xefcdab89, 0x98badcfe,
        0x10325476, 0xc3d2e1f0 ];
      this.W = new Array(80);
    }

    utils$1.inherits(SHA1, BlockHash$3);
    var _1 = SHA1;

    SHA1.blockSize = 512;
    SHA1.outSize = 160;
    SHA1.hmacStrength = 80;
    SHA1.padLength = 64;

    SHA1.prototype._update = function _update(msg, start) {
      var W = this.W;

      for (var i = 0; i < 16; i++)
        W[i] = msg[start + i];

      for(; i < W.length; i++)
        W[i] = rotl32$1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

      var a = this.h[0];
      var b = this.h[1];
      var c = this.h[2];
      var d = this.h[3];
      var e = this.h[4];

      for (i = 0; i < W.length; i++) {
        var s = ~~(i / 20);
        var t = sum32_5$1(rotl32$1(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
        e = d;
        d = c;
        c = rotl32$1(b, 30);
        b = a;
        a = t;
      }

      this.h[0] = sum32$2(this.h[0], a);
      this.h[1] = sum32$2(this.h[1], b);
      this.h[2] = sum32$2(this.h[2], c);
      this.h[3] = sum32$2(this.h[3], d);
      this.h[4] = sum32$2(this.h[4], e);
    };

    SHA1.prototype._digest = function digest(enc) {
      if (enc === 'hex')
        return utils$1.toHex32(this.h, 'big');
      else
        return utils$1.split32(this.h, 'big');
    };

    var sum32$1 = utils$1.sum32;
    var sum32_4$1 = utils$1.sum32_4;
    var sum32_5 = utils$1.sum32_5;
    var ch32 = common$1.ch32;
    var maj32 = common$1.maj32;
    var s0_256 = common$1.s0_256;
    var s1_256 = common$1.s1_256;
    var g0_256 = common$1.g0_256;
    var g1_256 = common$1.g1_256;

    var BlockHash$2 = common$2.BlockHash;

    var sha256_K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
      0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
      0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
      0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
      0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
      0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
      0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
      0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
      0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    function SHA256() {
      if (!(this instanceof SHA256))
        return new SHA256();

      BlockHash$2.call(this);
      this.h = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
      ];
      this.k = sha256_K;
      this.W = new Array(64);
    }
    utils$1.inherits(SHA256, BlockHash$2);
    var _256 = SHA256;

    SHA256.blockSize = 512;
    SHA256.outSize = 256;
    SHA256.hmacStrength = 192;
    SHA256.padLength = 64;

    SHA256.prototype._update = function _update(msg, start) {
      var W = this.W;

      for (var i = 0; i < 16; i++)
        W[i] = msg[start + i];
      for (; i < W.length; i++)
        W[i] = sum32_4$1(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);

      var a = this.h[0];
      var b = this.h[1];
      var c = this.h[2];
      var d = this.h[3];
      var e = this.h[4];
      var f = this.h[5];
      var g = this.h[6];
      var h = this.h[7];

      minimalisticAssert(this.k.length === W.length);
      for (i = 0; i < W.length; i++) {
        var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
        var T2 = sum32$1(s0_256(a), maj32(a, b, c));
        h = g;
        g = f;
        f = e;
        e = sum32$1(d, T1);
        d = c;
        c = b;
        b = a;
        a = sum32$1(T1, T2);
      }

      this.h[0] = sum32$1(this.h[0], a);
      this.h[1] = sum32$1(this.h[1], b);
      this.h[2] = sum32$1(this.h[2], c);
      this.h[3] = sum32$1(this.h[3], d);
      this.h[4] = sum32$1(this.h[4], e);
      this.h[5] = sum32$1(this.h[5], f);
      this.h[6] = sum32$1(this.h[6], g);
      this.h[7] = sum32$1(this.h[7], h);
    };

    SHA256.prototype._digest = function digest(enc) {
      if (enc === 'hex')
        return utils$1.toHex32(this.h, 'big');
      else
        return utils$1.split32(this.h, 'big');
    };

    function SHA224() {
      if (!(this instanceof SHA224))
        return new SHA224();

      _256.call(this);
      this.h = [
        0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
        0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4 ];
    }
    utils$1.inherits(SHA224, _256);
    var _224 = SHA224;

    SHA224.blockSize = 512;
    SHA224.outSize = 224;
    SHA224.hmacStrength = 192;
    SHA224.padLength = 64;

    SHA224.prototype._digest = function digest(enc) {
      // Just truncate output
      if (enc === 'hex')
        return utils$1.toHex32(this.h.slice(0, 7), 'big');
      else
        return utils$1.split32(this.h.slice(0, 7), 'big');
    };

    var rotr64_hi = utils$1.rotr64_hi;
    var rotr64_lo = utils$1.rotr64_lo;
    var shr64_hi = utils$1.shr64_hi;
    var shr64_lo = utils$1.shr64_lo;
    var sum64 = utils$1.sum64;
    var sum64_hi = utils$1.sum64_hi;
    var sum64_lo = utils$1.sum64_lo;
    var sum64_4_hi = utils$1.sum64_4_hi;
    var sum64_4_lo = utils$1.sum64_4_lo;
    var sum64_5_hi = utils$1.sum64_5_hi;
    var sum64_5_lo = utils$1.sum64_5_lo;

    var BlockHash$1 = common$2.BlockHash;

    var sha512_K = [
      0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
      0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
      0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
      0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
      0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
      0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
      0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
      0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
      0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
      0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
      0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
      0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
      0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
      0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
      0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
      0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
      0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
      0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
      0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
      0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
      0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
      0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
      0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
      0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
      0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
      0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
      0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
      0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
      0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
      0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
      0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
      0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
      0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
      0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
      0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
      0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
      0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
      0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
      0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
      0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
    ];

    function SHA512() {
      if (!(this instanceof SHA512))
        return new SHA512();

      BlockHash$1.call(this);
      this.h = [
        0x6a09e667, 0xf3bcc908,
        0xbb67ae85, 0x84caa73b,
        0x3c6ef372, 0xfe94f82b,
        0xa54ff53a, 0x5f1d36f1,
        0x510e527f, 0xade682d1,
        0x9b05688c, 0x2b3e6c1f,
        0x1f83d9ab, 0xfb41bd6b,
        0x5be0cd19, 0x137e2179 ];
      this.k = sha512_K;
      this.W = new Array(160);
    }
    utils$1.inherits(SHA512, BlockHash$1);
    var _512 = SHA512;

    SHA512.blockSize = 1024;
    SHA512.outSize = 512;
    SHA512.hmacStrength = 192;
    SHA512.padLength = 128;

    SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
      var W = this.W;

      // 32 x 32bit words
      for (var i = 0; i < 32; i++)
        W[i] = msg[start + i];
      for (; i < W.length; i += 2) {
        var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);  // i - 2
        var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
        var c1_hi = W[i - 14];  // i - 7
        var c1_lo = W[i - 13];
        var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);  // i - 15
        var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
        var c3_hi = W[i - 32];  // i - 16
        var c3_lo = W[i - 31];

        W[i] = sum64_4_hi(
          c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo);
        W[i + 1] = sum64_4_lo(
          c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo);
      }
    };

    SHA512.prototype._update = function _update(msg, start) {
      this._prepareBlock(msg, start);

      var W = this.W;

      var ah = this.h[0];
      var al = this.h[1];
      var bh = this.h[2];
      var bl = this.h[3];
      var ch = this.h[4];
      var cl = this.h[5];
      var dh = this.h[6];
      var dl = this.h[7];
      var eh = this.h[8];
      var el = this.h[9];
      var fh = this.h[10];
      var fl = this.h[11];
      var gh = this.h[12];
      var gl = this.h[13];
      var hh = this.h[14];
      var hl = this.h[15];

      minimalisticAssert(this.k.length === W.length);
      for (var i = 0; i < W.length; i += 2) {
        var c0_hi = hh;
        var c0_lo = hl;
        var c1_hi = s1_512_hi(eh, el);
        var c1_lo = s1_512_lo(eh, el);
        var c2_hi = ch64_hi(eh, el, fh, fl, gh);
        var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
        var c3_hi = this.k[i];
        var c3_lo = this.k[i + 1];
        var c4_hi = W[i];
        var c4_lo = W[i + 1];

        var T1_hi = sum64_5_hi(
          c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo,
          c4_hi, c4_lo);
        var T1_lo = sum64_5_lo(
          c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo,
          c4_hi, c4_lo);

        c0_hi = s0_512_hi(ah, al);
        c0_lo = s0_512_lo(ah, al);
        c1_hi = maj64_hi(ah, al, bh, bl, ch);
        c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);

        var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
        var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);

        hh = gh;
        hl = gl;

        gh = fh;
        gl = fl;

        fh = eh;
        fl = el;

        eh = sum64_hi(dh, dl, T1_hi, T1_lo);
        el = sum64_lo(dl, dl, T1_hi, T1_lo);

        dh = ch;
        dl = cl;

        ch = bh;
        cl = bl;

        bh = ah;
        bl = al;

        ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
        al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
      }

      sum64(this.h, 0, ah, al);
      sum64(this.h, 2, bh, bl);
      sum64(this.h, 4, ch, cl);
      sum64(this.h, 6, dh, dl);
      sum64(this.h, 8, eh, el);
      sum64(this.h, 10, fh, fl);
      sum64(this.h, 12, gh, gl);
      sum64(this.h, 14, hh, hl);
    };

    SHA512.prototype._digest = function digest(enc) {
      if (enc === 'hex')
        return utils$1.toHex32(this.h, 'big');
      else
        return utils$1.split32(this.h, 'big');
    };

    function ch64_hi(xh, xl, yh, yl, zh) {
      var r = (xh & yh) ^ ((~xh) & zh);
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function ch64_lo(xh, xl, yh, yl, zh, zl) {
      var r = (xl & yl) ^ ((~xl) & zl);
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function maj64_hi(xh, xl, yh, yl, zh) {
      var r = (xh & yh) ^ (xh & zh) ^ (yh & zh);
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function maj64_lo(xh, xl, yh, yl, zh, zl) {
      var r = (xl & yl) ^ (xl & zl) ^ (yl & zl);
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function s0_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 28);
      var c1_hi = rotr64_hi(xl, xh, 2);  // 34
      var c2_hi = rotr64_hi(xl, xh, 7);  // 39

      var r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function s0_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 28);
      var c1_lo = rotr64_lo(xl, xh, 2);  // 34
      var c2_lo = rotr64_lo(xl, xh, 7);  // 39

      var r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function s1_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 14);
      var c1_hi = rotr64_hi(xh, xl, 18);
      var c2_hi = rotr64_hi(xl, xh, 9);  // 41

      var r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function s1_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 14);
      var c1_lo = rotr64_lo(xh, xl, 18);
      var c2_lo = rotr64_lo(xl, xh, 9);  // 41

      var r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function g0_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 1);
      var c1_hi = rotr64_hi(xh, xl, 8);
      var c2_hi = shr64_hi(xh, xl, 7);

      var r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function g0_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 1);
      var c1_lo = rotr64_lo(xh, xl, 8);
      var c2_lo = shr64_lo(xh, xl, 7);

      var r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function g1_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 19);
      var c1_hi = rotr64_hi(xl, xh, 29);  // 61
      var c2_hi = shr64_hi(xh, xl, 6);

      var r = c0_hi ^ c1_hi ^ c2_hi;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function g1_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 19);
      var c1_lo = rotr64_lo(xl, xh, 29);  // 61
      var c2_lo = shr64_lo(xh, xl, 6);

      var r = c0_lo ^ c1_lo ^ c2_lo;
      if (r < 0)
        r += 0x100000000;
      return r;
    }

    function SHA384() {
      if (!(this instanceof SHA384))
        return new SHA384();

      _512.call(this);
      this.h = [
        0xcbbb9d5d, 0xc1059ed8,
        0x629a292a, 0x367cd507,
        0x9159015a, 0x3070dd17,
        0x152fecd8, 0xf70e5939,
        0x67332667, 0xffc00b31,
        0x8eb44a87, 0x68581511,
        0xdb0c2e0d, 0x64f98fa7,
        0x47b5481d, 0xbefa4fa4 ];
    }
    utils$1.inherits(SHA384, _512);
    var _384 = SHA384;

    SHA384.blockSize = 1024;
    SHA384.outSize = 384;
    SHA384.hmacStrength = 192;
    SHA384.padLength = 128;

    SHA384.prototype._digest = function digest(enc) {
      if (enc === 'hex')
        return utils$1.toHex32(this.h.slice(0, 12), 'big');
      else
        return utils$1.split32(this.h.slice(0, 12), 'big');
    };

    var sha1 = _1;
    var sha224 = _224;
    var sha256$2 = _256;
    var sha384 = _384;
    var sha512 = _512;

    var sha = {
    	sha1: sha1,
    	sha224: sha224,
    	sha256: sha256$2,
    	sha384: sha384,
    	sha512: sha512
    };

    var rotl32 = utils$1.rotl32;
    var sum32 = utils$1.sum32;
    var sum32_3 = utils$1.sum32_3;
    var sum32_4 = utils$1.sum32_4;
    var BlockHash = common$2.BlockHash;

    function RIPEMD160() {
      if (!(this instanceof RIPEMD160))
        return new RIPEMD160();

      BlockHash.call(this);

      this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
      this.endian = 'little';
    }
    utils$1.inherits(RIPEMD160, BlockHash);
    var ripemd160$1 = RIPEMD160;

    RIPEMD160.blockSize = 512;
    RIPEMD160.outSize = 160;
    RIPEMD160.hmacStrength = 192;
    RIPEMD160.padLength = 64;

    RIPEMD160.prototype._update = function update(msg, start) {
      var A = this.h[0];
      var B = this.h[1];
      var C = this.h[2];
      var D = this.h[3];
      var E = this.h[4];
      var Ah = A;
      var Bh = B;
      var Ch = C;
      var Dh = D;
      var Eh = E;
      for (var j = 0; j < 80; j++) {
        var T = sum32(
          rotl32(
            sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)),
            s$1[j]),
          E);
        A = E;
        E = D;
        D = rotl32(C, 10);
        C = B;
        B = T;
        T = sum32(
          rotl32(
            sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)),
            sh[j]),
          Eh);
        Ah = Eh;
        Eh = Dh;
        Dh = rotl32(Ch, 10);
        Ch = Bh;
        Bh = T;
      }
      T = sum32_3(this.h[1], C, Dh);
      this.h[1] = sum32_3(this.h[2], D, Eh);
      this.h[2] = sum32_3(this.h[3], E, Ah);
      this.h[3] = sum32_3(this.h[4], A, Bh);
      this.h[4] = sum32_3(this.h[0], B, Ch);
      this.h[0] = T;
    };

    RIPEMD160.prototype._digest = function digest(enc) {
      if (enc === 'hex')
        return utils$1.toHex32(this.h, 'little');
      else
        return utils$1.split32(this.h, 'little');
    };

    function f(j, x, y, z) {
      if (j <= 15)
        return x ^ y ^ z;
      else if (j <= 31)
        return (x & y) | ((~x) & z);
      else if (j <= 47)
        return (x | (~y)) ^ z;
      else if (j <= 63)
        return (x & z) | (y & (~z));
      else
        return x ^ (y | (~z));
    }

    function K(j) {
      if (j <= 15)
        return 0x00000000;
      else if (j <= 31)
        return 0x5a827999;
      else if (j <= 47)
        return 0x6ed9eba1;
      else if (j <= 63)
        return 0x8f1bbcdc;
      else
        return 0xa953fd4e;
    }

    function Kh(j) {
      if (j <= 15)
        return 0x50a28be6;
      else if (j <= 31)
        return 0x5c4dd124;
      else if (j <= 47)
        return 0x6d703ef3;
      else if (j <= 63)
        return 0x7a6d76e9;
      else
        return 0x00000000;
    }

    var r = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
      7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
      3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
      1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
      4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
    ];

    var rh = [
      5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
      6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
      15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
      8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
      12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
    ];

    var s$1 = [
      11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
      7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
      11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
      11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
      9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
    ];

    var sh = [
      8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
      9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
      9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
      15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
      8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
    ];

    var ripemd = {
    	ripemd160: ripemd160$1
    };

    function Hmac(hash, key, enc) {
      if (!(this instanceof Hmac))
        return new Hmac(hash, key, enc);
      this.Hash = hash;
      this.blockSize = hash.blockSize / 8;
      this.outSize = hash.outSize / 8;
      this.inner = null;
      this.outer = null;

      this._init(utils$1.toArray(key, enc));
    }
    var hmac = Hmac;

    Hmac.prototype._init = function init(key) {
      // Shorten key, if needed
      if (key.length > this.blockSize)
        key = new this.Hash().update(key).digest();
      minimalisticAssert(key.length <= this.blockSize);

      // Add padding to key
      for (var i = key.length; i < this.blockSize; i++)
        key.push(0);

      for (i = 0; i < key.length; i++)
        key[i] ^= 0x36;
      this.inner = new this.Hash().update(key);

      // 0x36 ^ 0x5c = 0x6a
      for (i = 0; i < key.length; i++)
        key[i] ^= 0x6a;
      this.outer = new this.Hash().update(key);
    };

    Hmac.prototype.update = function update(msg, enc) {
      this.inner.update(msg, enc);
      return this;
    };

    Hmac.prototype.digest = function digest(enc) {
      this.outer.update(this.inner.digest());
      return this.outer.digest(enc);
    };

    var hash_1 = createCommonjsModule(function (module, exports) {
    var hash = exports;

    hash.utils = utils$1;
    hash.common = common$2;
    hash.sha = sha;
    hash.ripemd = ripemd;
    hash.hmac = hmac;

    // Proxy hash functions to the main object
    hash.sha1 = hash.sha.sha1;
    hash.sha256 = hash.sha.sha256;
    hash.sha224 = hash.sha.sha224;
    hash.sha384 = hash.sha.sha384;
    hash.sha512 = hash.sha.sha512;
    hash.ripemd160 = hash.ripemd.ripemd160;
    });

    var hash = hash_1;

    function sha256$1(payload) {
        return Uint8Array.from(hash.sha256().update(payload).digest());
    }
    function ripemd160(payload) {
        return Uint8Array.from(hash.ripemd160().update(payload).digest());
    }
    function hash160$1(payload) {
        return ripemd160(sha256$1(payload));
    }
    function hash256(payload) {
        return sha256$1(sha256$1(payload));
    }

    const Op = OpcodesBCH;
    // TODO: Replace this when these opcodes are in Libauth
    var IntrospectionOp;
    (function (IntrospectionOp) {
        IntrospectionOp[IntrospectionOp["OP_INPUTINDEX"] = 192] = "OP_INPUTINDEX";
        IntrospectionOp[IntrospectionOp["OP_ACTIVEBYTECODE"] = 193] = "OP_ACTIVEBYTECODE";
        IntrospectionOp[IntrospectionOp["OP_TXVERSION"] = 194] = "OP_TXVERSION";
        IntrospectionOp[IntrospectionOp["OP_TXINPUTCOUNT"] = 195] = "OP_TXINPUTCOUNT";
        IntrospectionOp[IntrospectionOp["OP_TXOUTPUTCOUNT"] = 196] = "OP_TXOUTPUTCOUNT";
        IntrospectionOp[IntrospectionOp["OP_TXLOCKTIME"] = 197] = "OP_TXLOCKTIME";
        IntrospectionOp[IntrospectionOp["OP_UTXOVALUE"] = 198] = "OP_UTXOVALUE";
        IntrospectionOp[IntrospectionOp["OP_UTXOBYTECODE"] = 199] = "OP_UTXOBYTECODE";
        IntrospectionOp[IntrospectionOp["OP_OUTPOINTTXHASH"] = 200] = "OP_OUTPOINTTXHASH";
        IntrospectionOp[IntrospectionOp["OP_OUTPOINTINDEX"] = 201] = "OP_OUTPOINTINDEX";
        IntrospectionOp[IntrospectionOp["OP_INPUTBYTECODE"] = 202] = "OP_INPUTBYTECODE";
        IntrospectionOp[IntrospectionOp["OP_INPUTSEQUENCENUMBER"] = 203] = "OP_INPUTSEQUENCENUMBER";
        IntrospectionOp[IntrospectionOp["OP_OUTPUTVALUE"] = 204] = "OP_OUTPUTVALUE";
        IntrospectionOp[IntrospectionOp["OP_OUTPUTBYTECODE"] = 205] = "OP_OUTPUTBYTECODE";
    })(IntrospectionOp || (IntrospectionOp = {}));
    const introspectionOpMapping = {
        OP_INPUTINDEX: 'OP_UNKNOWN192',
        OP_ACTIVEBYTECODE: 'OP_UNKNOWN193',
        OP_TXVERSION: 'OP_UNKNOWN194',
        OP_TXINPUTCOUNT: 'OP_UNKNOWN195',
        OP_TXOUTPUTCOUNT: 'OP_UNKNOWN196',
        OP_TXLOCKTIME: 'OP_UNKNOWN197',
        OP_UTXOVALUE: 'OP_UNKNOWN198',
        OP_UTXOBYTECODE: 'OP_UNKNOWN199',
        OP_OUTPOINTTXHASH: 'OP_UNKNOWN200',
        OP_OUTPOINTINDEX: 'OP_UNKNOWN201',
        OP_INPUTBYTECODE: 'OP_UNKNOWN202',
        OP_INPUTSEQUENCENUMBER: 'OP_UNKNOWN203',
        OP_OUTPUTVALUE: 'OP_UNKNOWN204',
        OP_OUTPUTBYTECODE: 'OP_UNKNOWN205',
    };
    const reverseIntrospectionOpMapping = Object.fromEntries(Object.entries(introspectionOpMapping).map(([k, v]) => ([v, k])));
    function scriptToAsm(script) {
        return bytecodeToAsm(scriptToBytecode(script));
    }
    function asmToScript(asm) {
        return bytecodeToScript(asmToBytecode(asm));
    }
    function scriptToBytecode(script) {
        // Convert the script elements to AuthenticationInstructions
        const instructions = script.map((opOrData) => {
            if (typeof opOrData === 'number') {
                return { opcode: opOrData };
            }
            return parseBytecode(encodeDataPush(opOrData))[0];
        });
        // Convert the AuthenticationInstructions to bytecode
        return serializeAuthenticationInstructions(instructions);
    }
    function bytecodeToScript(bytecode) {
        // Convert the bytecode to AuthenticationInstructions
        const instructions = parseBytecode(bytecode);
        // Convert the AuthenticationInstructions to script elements
        const script = instructions.map((instruction) => ('data' in instruction ? instruction.data : instruction.opcode));
        return script;
    }
    function asmToBytecode(asm) {
        // Remove any duplicate whitespace
        asm = asm.replace(/\s+/g, ' ').trim();
        // Replace introspection ops with OP_UNKNOWN... so Libauth gets it
        asm = asm.split(' ').map((token) => { var _a; return (_a = introspectionOpMapping[token]) !== null && _a !== void 0 ? _a : token; }).join(' ');
        // Convert the ASM tokens to AuthenticationInstructions
        const instructions = asm.split(' ').map((token) => {
            if (token.startsWith('OP_')) {
                return { opcode: Op[token] };
            }
            return parseBytecode(encodeDataPush(hexToBin(token)))[0];
        });
        // Convert the AuthenticationInstructions to bytecode
        return serializeAuthenticationInstructions(instructions);
    }
    function bytecodeToAsm(bytecode) {
        // Convert the bytecode to libauth's ASM format
        let asm = disassembleBytecodeBCH(bytecode);
        // COnvert libauth's ASM format to BITBOX's
        asm = asm.replace(/OP_PUSHBYTES_[^\s]+/g, '');
        asm = asm.replace(/OP_PUSHDATA[^\s]+ [^\s]+/g, '');
        asm = asm.replace(/(^|\s)0x/g, ' ');
        // Replace OP_UNKNOWN... with the correct ops
        asm = asm.split(' ').map((token) => { var _a; return (_a = reverseIntrospectionOpMapping[token]) !== null && _a !== void 0 ? _a : token; }).join(' ');
        // Remove any duplicate whitespace
        asm = asm.replace(/\s+/g, ' ').trim();
        return asm;
    }
    function countOpcodes(script) {
        return script
            .filter((opOrData) => typeof opOrData === 'number')
            .filter((op) => op > Op.OP_16)
            .length;
    }
    function calculateBytesize(script) {
        return scriptToBytecode(script).byteLength;
    }
    // For encoding OP_RETURN data (doesn't require BIP62.3 / MINIMALDATA)
    function encodeNullDataScript$1(chunks) {
        return flattenBinArray(chunks.map((chunk) => {
            if (typeof chunk === 'number') {
                return new Uint8Array([chunk]);
            }
            const pushdataOpcode = getPushDataOpcode$1(chunk);
            return new Uint8Array([...pushdataOpcode, ...chunk]);
        }));
    }
    function getPushDataOpcode$1(data) {
        const { byteLength } = data;
        if (byteLength === 0)
            return Uint8Array.from([0x4c, 0x00]);
        if (byteLength < 76)
            return Uint8Array.from([byteLength]);
        if (byteLength < 256)
            return Uint8Array.from([0x4c, byteLength]);
        throw Error('Pushdata too large');
    }
    /**
     * When cutting out the tx.bytecode preimage variable, the compiler does not know
     * the size of the final redeem scrip yet, because the constructor parameters still
     * need to get added. Because of this it does not know whether the VarInt is 1 or 3
     * bytes. During compilation, an OP_NOP is added at the spot where the bytecode is
     * cut out. This function replaces that OP_NOP and adds either 1 or 3 to the cut to
     * additionally cut off the VarInt.
     *
     * @param script incomplete redeem script
     * @returns completed redeem script
     */
    function replaceBytecodeNop(script) {
        const index = script.findIndex((op) => op === Op.OP_NOP);
        if (index < 0)
            return script;
        // Remove the OP_NOP
        script.splice(index, 1);
        // Retrieve size of current OP_SPLIT
        let oldCut = script[index];
        if (oldCut instanceof Uint8Array) {
            oldCut = decodeInt(oldCut);
        }
        else if (oldCut === Op.OP_0) {
            oldCut = 0;
        }
        else if (oldCut >= Op.OP_1 && oldCut <= Op.OP_16) {
            oldCut -= 80;
        }
        else {
            return script;
        }
        // Update the old OP_SPLIT by adding either 1 or 3 to it
        script[index] = encodeInt(oldCut + 1);
        const bytecodeSize = calculateBytesize(script);
        if (bytecodeSize > 252) {
            script[index] = encodeInt(oldCut + 3);
        }
        // Minimally encode
        return asmToScript(scriptToAsm(script));
    }
    function generateRedeemScript(baseScript, encodedArgs) {
        return replaceBytecodeNop([...encodedArgs, ...baseScript]);
    }

    class BytesType {
        constructor(bound) {
            this.bound = bound;
        }
        static fromString(str) {
            const bound = str === 'byte' ? 1 : Number.parseInt(str.substring(5), 10) || undefined;
            return new BytesType(bound);
        }
        toString() {
            var _a;
            return `bytes${(_a = this.bound) !== null && _a !== void 0 ? _a : ''}`;
        }
    }
    var PrimitiveType;
    (function (PrimitiveType) {
        PrimitiveType["INT"] = "int";
        PrimitiveType["BOOL"] = "bool";
        PrimitiveType["STRING"] = "string";
        // ADDRESS = 'address',
        PrimitiveType["PUBKEY"] = "pubkey";
        PrimitiveType["SIG"] = "sig";
        PrimitiveType["DATASIG"] = "datasig";
        PrimitiveType["ANY"] = "any";
    })(PrimitiveType || (PrimitiveType = {}));
    ({
        [PrimitiveType.INT]: [
            PrimitiveType.INT, PrimitiveType.BOOL,
        ],
        [PrimitiveType.BOOL]: [PrimitiveType.BOOL, PrimitiveType.INT],
        [PrimitiveType.STRING]: [PrimitiveType.STRING],
        [PrimitiveType.PUBKEY]: [PrimitiveType.PUBKEY],
        [PrimitiveType.SIG]: [PrimitiveType.SIG],
        [PrimitiveType.DATASIG]: [PrimitiveType.DATASIG],
        [PrimitiveType.ANY]: [],
    });
    function parseType(str) {
        if (str.startsWith('byte'))
            return BytesType.fromString(str);
        return PrimitiveType[str.toUpperCase()];
    }

    // see https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki#compatibility

    const SEQUENCE_FINAL = 0xffffffff;
    const SEQUENCE_LOCKTIME_DISABLE_FLAG = (1 << 31);
    const SEQUENCE_LOCKTIME_GRANULARITY = 9;
    const SEQUENCE_LOCKTIME_MASK = 0x0000ffff;
    const SEQUENCE_LOCKTIME_TYPE_FLAG = (1 << 22);

    const BLOCKS_MAX = SEQUENCE_LOCKTIME_MASK;
    const SECONDS_MOD = 1 << SEQUENCE_LOCKTIME_GRANULARITY;
    const SECONDS_MAX = SEQUENCE_LOCKTIME_MASK << SEQUENCE_LOCKTIME_GRANULARITY;

    function decode (sequence) {
      if (sequence & SEQUENCE_LOCKTIME_DISABLE_FLAG) return {}
      if (sequence & SEQUENCE_LOCKTIME_TYPE_FLAG) {
        return {
          seconds: (sequence & SEQUENCE_LOCKTIME_MASK) << SEQUENCE_LOCKTIME_GRANULARITY
        }
      }

      return {
        blocks: sequence & SEQUENCE_LOCKTIME_MASK
      }
    }

    function encode$1 ({ blocks, seconds }) {
      if (blocks !== undefined && seconds !== undefined) throw new TypeError('Cannot encode blocks AND seconds')
      if (blocks === undefined && seconds === undefined) return SEQUENCE_FINAL // neither? assume final

      if (seconds !== undefined) {
        if (!Number.isFinite(seconds)) throw new TypeError('Expected Number seconds')
        if (seconds > SECONDS_MAX) throw new TypeError('Expected Number seconds <= ' + SECONDS_MAX)
        if (seconds % SECONDS_MOD !== 0) throw new TypeError('Expected Number seconds as a multiple of ' + SECONDS_MOD)

        return SEQUENCE_LOCKTIME_TYPE_FLAG | (seconds >> SEQUENCE_LOCKTIME_GRANULARITY)
      }

      if (!Number.isFinite(blocks)) throw new TypeError('Expected Number blocks')
      if (blocks > SEQUENCE_LOCKTIME_MASK) throw new TypeError('Expected Number blocks <= ' + BLOCKS_MAX)

      return blocks
    }

    var bip68 = { decode, encode: encode$1 };

    // From https://github.com/sindresorhus/random-int/blob/c37741b56f76b9160b0b63dae4e9c64875128146/index.js#L13-L15
    const randomInteger = (minimum, maximum) => Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);

    const createAbortError = () => {
    	const error = new Error('Delay aborted');
    	error.name = 'AbortError';
    	return error;
    };

    const createDelay = ({clearTimeout: defaultClear, setTimeout: set, willResolve}) => (ms, {value, signal} = {}) => {
    	if (signal && signal.aborted) {
    		return Promise.reject(createAbortError());
    	}

    	let timeoutId;
    	let settle;
    	let rejectFn;
    	const clear = defaultClear || clearTimeout;

    	const signalListener = () => {
    		clear(timeoutId);
    		rejectFn(createAbortError());
    	};

    	const cleanup = () => {
    		if (signal) {
    			signal.removeEventListener('abort', signalListener);
    		}
    	};

    	const delayPromise = new Promise((resolve, reject) => {
    		settle = () => {
    			cleanup();
    			if (willResolve) {
    				resolve(value);
    			} else {
    				reject(value);
    			}
    		};

    		rejectFn = reject;
    		timeoutId = (set || setTimeout)(settle, ms);
    	});

    	if (signal) {
    		signal.addEventListener('abort', signalListener, {once: true});
    	}

    	delayPromise.clear = () => {
    		clear(timeoutId);
    		timeoutId = null;
    		settle();
    	};

    	return delayPromise;
    };

    const createWithTimers = clearAndSet => {
    	const delay = createDelay({...clearAndSet, willResolve: true});
    	delay.reject = createDelay({...clearAndSet, willResolve: false});
    	delay.range = (minimum, maximum, options) => delay(randomInteger(minimum, maximum), options);
    	return delay;
    };

    const delay = createWithTimers();
    delay.createWithTimers = createWithTimers;

    var delay_1 = delay;
    // TODO: Remove this for the next major release
    var _default$1 = delay;
    delay_1.default = _default$1;

    function isSignableUtxo(utxo) {
        return 'template' in utxo;
    }
    var SignatureAlgorithm;
    (function (SignatureAlgorithm) {
        SignatureAlgorithm[SignatureAlgorithm["ECDSA"] = 0] = "ECDSA";
        SignatureAlgorithm[SignatureAlgorithm["SCHNORR"] = 1] = "SCHNORR";
    })(SignatureAlgorithm || (SignatureAlgorithm = {}));
    var HashType;
    (function (HashType) {
        HashType[HashType["SIGHASH_ALL"] = 1] = "SIGHASH_ALL";
        HashType[HashType["SIGHASH_NONE"] = 2] = "SIGHASH_NONE";
        HashType[HashType["SIGHASH_SINGLE"] = 3] = "SIGHASH_SINGLE";
        HashType[HashType["SIGHASH_ANYONECANPAY"] = 128] = "SIGHASH_ANYONECANPAY";
    })(HashType || (HashType = {}));
    // Weird setup to allow both Enum parameters, as well as literal strings
    // https://stackoverflow.com/questions/51433319/typescript-constructor-accept-string-for-enum
    const literal = (l) => l;
    const Network = {
        MAINNET: literal('mainnet'),
        TESTNET: literal('testnet'),
        STAGING: literal('staging'),
        REGTEST: literal('regtest'),
    };

    const DUST_LIMIT = 546;
    const P2PKH_OUTPUT_SIZE = 34;
    const P2SH_OUTPUT_SIZE = 32;
    const VERSION_SIZE = 4;
    const LOCKTIME_SIZE = 4;

    class TypeError$1 extends Error {
        constructor(actual, expected) {
            super(`Found type '${actual}' where type '${expected.toString()}' was expected`);
        }
    }
    class OutputSatoshisTooSmallError extends Error {
        constructor(satoshis) {
            super(`Tried to add an output with ${satoshis} satoshis, which is less than the DUST limit (${DUST_LIMIT})`);
        }
    }
    class FailedTransactionError extends Error {
        constructor(reason, meep) {
            super(`Transaction failed with reason: ${reason}\n${meep}`);
            this.reason = reason;
            this.meep = meep;
        }
    }
    class FailedRequireError extends FailedTransactionError {
    }
    class FailedTimeCheckError extends FailedTransactionError {
    }
    class FailedSigCheckError extends FailedTransactionError {
    }
    // TODO: Expand these reasons with non-script failures (like tx-mempool-conflict)
    var Reason;
    (function (Reason) {
        Reason["EVAL_FALSE"] = "Script evaluated without error but finished with a false/empty top stack element";
        Reason["VERIFY"] = "Script failed an OP_VERIFY operation";
        Reason["EQUALVERIFY"] = "Script failed an OP_EQUALVERIFY operation";
        Reason["CHECKMULTISIGVERIFY"] = "Script failed an OP_CHECKMULTISIGVERIFY operation";
        Reason["CHECKSIGVERIFY"] = "Script failed an OP_CHECKSIGVERIFY operation";
        Reason["CHECKDATASIGVERIFY"] = "Script failed an OP_CHECKDATASIGVERIFY operation";
        Reason["NUMEQUALVERIFY"] = "Script failed an OP_NUMEQUALVERIFY operation";
        Reason["SCRIPT_SIZE"] = "Script is too big";
        Reason["PUSH_SIZE"] = "Push value size limit exceeded";
        Reason["OP_COUNT"] = "Operation limit exceeded";
        Reason["STACK_SIZE"] = "Stack size limit exceeded";
        Reason["SIG_COUNT"] = "Signature count negative or greater than pubkey count";
        Reason["PUBKEY_COUNT"] = "Pubkey count negative or limit exceeded";
        Reason["INVALID_OPERAND_SIZE"] = "Invalid operand size";
        Reason["INVALID_NUMBER_RANGE"] = "Given operand is not a number within the valid range";
        Reason["IMPOSSIBLE_ENCODING"] = "The requested encoding is impossible to satisfy";
        Reason["INVALID_SPLIT_RANGE"] = "Invalid OP_SPLIT range";
        Reason["INVALID_BIT_COUNT"] = "Invalid number of bit set in OP_CHECKMULTISIG";
        Reason["BAD_OPCODE"] = "Opcode missing or not understood";
        Reason["DISABLED_OPCODE"] = "Attempted to use a disabled opcode";
        Reason["INVALID_STACK_OPERATION"] = "Operation not valid with the current stack size";
        Reason["INVALID_ALTSTACK_OPERATION"] = "Operation not valid with the current altstack size";
        Reason["OP_RETURN"] = "OP_RETURN was encountered";
        Reason["UNBALANCED_CONDITIONAL"] = "Invalid OP_IF construction";
        Reason["DIV_BY_ZERO"] = "Division by zero error";
        Reason["MOD_BY_ZERO"] = "Modulo by zero error";
        Reason["INVALID_BITFIELD_SIZE"] = "Bitfield of unexpected size error";
        Reason["INVALID_BIT_RANGE"] = "Bitfield's bit out of the expected range";
        Reason["NEGATIVE_LOCKTIME"] = "Negative locktime";
        Reason["UNSATISFIED_LOCKTIME"] = "Locktime requirement not satisfied";
        Reason["SIG_HASHTYPE"] = "Signature hash type missing or not understood";
        Reason["SIG_DER"] = "Non-canonical DER signature";
        Reason["MINIMALDATA"] = "Data push larger than necessary";
        Reason["SIG_PUSHONLY"] = "Only push operators allowed in signature scripts";
        Reason["SIG_HIGH_S"] = "Non-canonical signature: S value is unnecessarily high";
        Reason["MINIMALIF"] = "OP_IF/NOTIF argument must be minimal";
        Reason["SIG_NULLFAIL"] = "Signature must be zero for failed CHECK(MULTI)SIG operation";
        Reason["SIG_BADLENGTH"] = "Signature cannot be 65 bytes in CHECKMULTISIG";
        Reason["SIG_NONSCHNORR"] = "Only Schnorr signatures allowed in this operation";
        Reason["DISCOURAGE_UPGRADABLE_NOPS"] = "NOPx reserved for soft-fork upgrades";
        Reason["PUBKEYTYPE"] = "Public key is neither compressed or uncompressed";
        Reason["CLEANSTACK"] = "Script did not clean its stack";
        Reason["NONCOMPRESSED_PUBKEY"] = "Using non-compressed public key";
        Reason["ILLEGAL_FORKID"] = "Illegal use of SIGHASH_FORKID";
        Reason["MUST_USE_FORKID"] = "Signature must use SIGHASH_FORKID";
        Reason["UNKNOWN"] = "unknown error";
    })(Reason || (Reason = {}));

    // ////////// PARAMETER VALIDATION ////////////////////////////////////////////
    function validateRecipient(recipient) {
        if (recipient.amount < DUST_LIMIT) {
            throw new OutputSatoshisTooSmallError(recipient.amount);
        }
    }
    // ////////// SIZE CALCULATIONS ///////////////////////////////////////////////
    function getInputSize(inputScript) {
        const scriptSize = inputScript.byteLength;
        const varIntSize = scriptSize > 252 ? 3 : 1;
        return 32 + 4 + varIntSize + scriptSize + 4;
    }
    function getPreimageSize(script) {
        const scriptSize = script.byteLength;
        const varIntSize = scriptSize > 252 ? 3 : 1;
        return 4 + 32 + 32 + 36 + varIntSize + scriptSize + 8 + 4 + 32 + 4 + 4;
    }
    function getTxSizeWithoutInputs(outputs) {
        // Transaction format:
        // Version (4 Bytes)
        // TxIn Count (1 ~ 9B)
        // For each TxIn:
        //   Outpoint (36B)
        //   Script Length (1 ~ 9B)
        //   ScriptSig(?)
        //   Sequence (4B)
        // TxOut Count (1 ~ 9B)
        // For each TxOut:
        //   Value (8B)
        //   Script Length(1 ~ 9B)*
        //   Script (?)*
        // LockTime (4B)
        let size = VERSION_SIZE + LOCKTIME_SIZE;
        size += outputs.reduce((acc, output) => {
            if (typeof output.to === 'string') {
                return acc + P2PKH_OUTPUT_SIZE;
            }
            // Size of an OP_RETURN output = byteLength + 8 (amount) + 2 (scriptSize)
            return acc + output.to.byteLength + 8 + 2;
        }, 0);
        // Add tx-out count (accounting for a potential change output)
        size += encodeInt(outputs.length + 1).byteLength;
        return size;
    }
    // ////////// BUILD OBJECTS ///////////////////////////////////////////////////
    function createInputScript(redeemScript, encodedArgs, selector, preimage) {
        // Create unlock script / redeemScriptSig (add potential preimage and selector)
        const unlockScript = encodedArgs.reverse();
        if (preimage !== undefined)
            unlockScript.push(preimage);
        if (selector !== undefined)
            unlockScript.push(encodeInt(selector));
        // Create input script and compile it to bytecode
        const inputScript = [...unlockScript, scriptToBytecode(redeemScript)];
        return scriptToBytecode(inputScript);
    }
    function createOpReturnOutput(opReturnData) {
        const script = [
            Op.OP_RETURN,
            ...opReturnData.map((output) => toBin$1(output)),
        ];
        return { to: encodeNullDataScript(script), amount: 0 };
    }
    function toBin$1(output) {
        const data = output.replace(/^0x/, '');
        const encode = data === output ? utf8ToBin : hexToBin;
        return encode(data);
    }
    function createSighashPreimage(transaction, input, inputIndex, coveredBytecode, hashtype) {
        const state = createTransactionContextCommon({
            inputIndex,
            sourceOutput: { satoshis: bigIntToBinUint64LE(BigInt(input.satoshis)) },
            spendingTransaction: transaction,
        });
        const sighashPreimage = generateSigningSerializationBCH({
            correspondingOutput: state.correspondingOutput,
            coveredBytecode,
            forkId: new Uint8Array([0, 0, 0]),
            locktime: state.locktime,
            outpointIndex: state.outpointIndex,
            outpointTransactionHash: state.outpointTransactionHash,
            outputValue: state.outputValue,
            sequenceNumber: state.sequenceNumber,
            sha256: { hash: sha256$1 },
            signingSerializationType: new Uint8Array([hashtype]),
            transactionOutpoints: state.transactionOutpoints,
            transactionOutputs: state.transactionOutputs,
            transactionSequenceNumbers: state.transactionSequenceNumbers,
            version: 2,
        });
        return sighashPreimage;
    }
    function buildError(reason, meepStr) {
        const require = [
            Reason.EVAL_FALSE, Reason.VERIFY, Reason.EQUALVERIFY, Reason.CHECKMULTISIGVERIFY,
            Reason.CHECKSIGVERIFY, Reason.CHECKDATASIGVERIFY, Reason.NUMEQUALVERIFY,
        ];
        const timeCheck = [Reason.NEGATIVE_LOCKTIME, Reason.UNSATISFIED_LOCKTIME];
        const sigCheck = [
            Reason.SIG_COUNT, Reason.PUBKEY_COUNT, Reason.SIG_HASHTYPE, Reason.SIG_DER,
            Reason.SIG_HIGH_S, Reason.SIG_NULLFAIL, Reason.SIG_BADLENGTH, Reason.SIG_NONSCHNORR,
        ];
        if (toRegExp(require).test(reason)) {
            return new FailedRequireError(reason, meepStr);
        }
        if (toRegExp(timeCheck).test(reason)) {
            return new FailedTimeCheckError(reason, meepStr);
        }
        if (toRegExp(sigCheck).test(reason)) {
            return new FailedSigCheckError(reason, meepStr);
        }
        return new FailedTransactionError(reason, meepStr);
    }
    function toRegExp(reasons) {
        return new RegExp(reasons.join('|').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
    }
    // ////////// MISC ////////////////////////////////////////////////////////////
    function meep(tx, utxos, script) {
        const scriptPubkey = binToHex(scriptToLockingBytecode(script));
        return `meep debug --tx=${tx} --idx=0 --amt=${utxos[0].satoshis} --pkscript=${scriptPubkey}`;
    }
    function scriptToAddress(script, network) {
        const lockingBytecode = scriptToLockingBytecode(script);
        const prefix = getNetworkPrefix(network);
        const address = lockingBytecodeToCashAddress(lockingBytecode, prefix);
        return address;
    }
    function scriptToLockingBytecode(script) {
        const scriptHash = hash160$1(scriptToBytecode(script));
        const addressContents = { payload: scriptHash, type: AddressType.p2sh };
        const lockingBytecode = addressContentsToLockingBytecode(addressContents);
        return lockingBytecode;
    }
    /**
    * Helper function to convert an address to a locking script
    *
    * @param address   Address to convert to locking script
    *
    * @returns a locking script corresponding to the passed address
    */
    function addressToLockScript(address) {
        const result = cashAddressToLockingBytecode(address);
        if (typeof result === 'string')
            throw new Error(result);
        return result.bytecode;
    }
    function getNetworkPrefix(network) {
        switch (network) {
            case Network.MAINNET:
                return 'bitcoincash';
            case Network.STAGING:
                return 'bchtest';
            case Network.TESTNET:
                return 'bchtest';
            case Network.REGTEST:
                return 'bchreg';
            default:
                return 'bitcoincash';
        }
    }
    // ////////////////////////////////////////////////////////////////////////////
    // For encoding OP_RETURN data (doesn't require BIP62.3 / MINIMALDATA)
    function encodeNullDataScript(chunks) {
        return flattenBinArray(chunks.map((chunk) => {
            if (typeof chunk === 'number') {
                return new Uint8Array([chunk]);
            }
            const pushdataOpcode = getPushDataOpcode(chunk);
            return new Uint8Array([...pushdataOpcode, ...chunk]);
        }));
    }
    function getPushDataOpcode(data) {
        const { byteLength } = data;
        if (byteLength === 0)
            return Uint8Array.from([0x4c, 0x00]);
        if (byteLength < 76)
            return Uint8Array.from([byteLength]);
        if (byteLength < 256)
            return Uint8Array.from([0x4c, byteLength]);
        throw Error('Pushdata too large');
    }

    class SignatureTemplate {
        constructor(signer, hashtype = HashType.SIGHASH_ALL, signatureAlgorithm = SignatureAlgorithm.SCHNORR) {
            this.hashtype = hashtype;
            this.signatureAlgorithm = signatureAlgorithm;
            if (isKeypair(signer)) {
                const wif = signer.toWIF();
                this.privateKey = decodeWif(wif);
            }
            else if (typeof signer === 'string') {
                this.privateKey = decodeWif(signer);
            }
            else {
                this.privateKey = signer;
            }
        }
        generateSignature(payload, secp256k1, bchForkId) {
            const signature = this.signatureAlgorithm === SignatureAlgorithm.SCHNORR
                ? secp256k1.signMessageHashSchnorr(this.privateKey, payload)
                : secp256k1.signMessageHashDER(this.privateKey, payload);
            return Uint8Array.from([...signature, this.getHashType(bchForkId)]);
        }
        getHashType(bchForkId = true) {
            return bchForkId ? (this.hashtype | SigningSerializationFlag.forkId) : this.hashtype;
        }
        getPublicKey(secp256k1) {
            return secp256k1.derivePublicKeyCompressed(this.privateKey);
        }
    }
    function isKeypair(obj) {
        return typeof obj.toWIF === 'function';
    }
    function decodeWif(wif) {
        const result = decodePrivateKeyWif({ hash: sha256$1 }, wif);
        if (typeof result === 'string') {
            throw new Error(result);
        }
        return result.privateKey;
    }

    var __awaiter$3 = (window && window.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    class Transaction {
        constructor(address, provider, redeemScript, abiFunction, args, selector) {
            this.address = address;
            this.provider = provider;
            this.redeemScript = redeemScript;
            this.abiFunction = abiFunction;
            this.args = args;
            this.selector = selector;
            this.inputs = [];
            this.outputs = [];
            this.sequence = 0xfffffffe;
            this.feePerByte = 1.0;
            this.minChange = DUST_LIMIT;
        }
        from(inputOrInputs) {
            if (!Array.isArray(inputOrInputs)) {
                inputOrInputs = [inputOrInputs];
            }
            this.inputs = this.inputs.concat(inputOrInputs);
            return this;
        }
        experimentalFromP2PKH(inputOrInputs, template) {
            if (!Array.isArray(inputOrInputs)) {
                inputOrInputs = [inputOrInputs];
            }
            inputOrInputs = inputOrInputs.map((input) => (Object.assign(Object.assign({}, input), { template })));
            this.inputs = this.inputs.concat(inputOrInputs);
            return this;
        }
        to(toOrOutputs, amount) {
            if (typeof toOrOutputs === 'string' && typeof amount === 'number') {
                return this.to([{ to: toOrOutputs, amount }]);
            }
            if (Array.isArray(toOrOutputs) && amount === undefined) {
                toOrOutputs.forEach(validateRecipient);
                this.outputs = this.outputs.concat(toOrOutputs);
                return this;
            }
            throw new Error('Incorrect arguments passed to function \'to\'');
        }
        withOpReturn(chunks) {
            this.outputs.push(createOpReturnOutput(chunks));
            return this;
        }
        withAge(age) {
            this.sequence = bip68.encode({ blocks: age });
            return this;
        }
        withTime(time) {
            this.locktime = time;
            return this;
        }
        withHardcodedFee(hardcodedFee) {
            this.hardcodedFee = hardcodedFee;
            return this;
        }
        withFeePerByte(feePerByte) {
            this.feePerByte = feePerByte;
            return this;
        }
        withMinChange(minChange) {
            this.minChange = minChange;
            return this;
        }
        withoutChange() {
            return this.withMinChange(Number.MAX_VALUE);
        }
        build() {
            var _a;
            return __awaiter$3(this, void 0, void 0, function* () {
                this.locktime = (_a = this.locktime) !== null && _a !== void 0 ? _a : yield this.provider.getBlockHeight();
                yield this.setInputsAndOutputs();
                const secp256k1 = yield instantiateSecp256k1();
                const bytecode = scriptToBytecode(this.redeemScript);
                const inputs = this.inputs.map((utxo) => ({
                    outpointIndex: utxo.vout,
                    outpointTransactionHash: hexToBin(utxo.txid),
                    sequenceNumber: this.sequence,
                    unlockingBytecode: new Uint8Array(),
                }));
                const outputs = this.outputs.map((output) => {
                    const lockingBytecode = typeof output.to === 'string'
                        ? addressToLockScript(output.to)
                        : output.to;
                    const satoshis = bigIntToBinUint64LE(BigInt(output.amount));
                    return { lockingBytecode, satoshis };
                });
                const transaction = {
                    inputs,
                    locktime: this.locktime,
                    outputs,
                    version: 2,
                };
                const inputScripts = [];
                this.inputs.forEach((utxo, i) => {
                    // UTXO's with signature templates are signed using P2PKH
                    if (isSignableUtxo(utxo)) {
                        const pubkey = utxo.template.getPublicKey(secp256k1);
                        const pubkeyHash = hash160$1(pubkey);
                        const addressContents = { payload: pubkeyHash, type: AddressType.p2pkh };
                        const prevOutScript = addressContentsToLockingBytecode(addressContents);
                        const hashtype = utxo.template.getHashType();
                        const preimage = createSighashPreimage(transaction, utxo, i, prevOutScript, hashtype);
                        const sighash = hash256(preimage);
                        const signature = utxo.template.generateSignature(sighash, secp256k1);
                        const inputScript = scriptToBytecode([signature, pubkey]);
                        inputScripts.push(inputScript);
                        return;
                    }
                    let covenantHashType = -1;
                    const completeArgs = this.args.map((arg) => {
                        if (!(arg instanceof SignatureTemplate))
                            return arg;
                        // First signature is used for sighash preimage (maybe not the best way)
                        if (covenantHashType < 0)
                            covenantHashType = arg.getHashType();
                        const preimage = createSighashPreimage(transaction, utxo, i, bytecode, arg.getHashType());
                        const sighash = hash256(preimage);
                        return arg.generateSignature(sighash, secp256k1);
                    });
                    const preimage = this.abiFunction.covenant
                        ? createSighashPreimage(transaction, utxo, i, bytecode, covenantHashType)
                        : undefined;
                    const inputScript = createInputScript(this.redeemScript, completeArgs, this.selector, preimage);
                    inputScripts.push(inputScript);
                });
                inputScripts.forEach((script, i) => {
                    transaction.inputs[i].unlockingBytecode = script;
                });
                return binToHex(encodeTransaction(transaction));
            });
        }
        send(raw) {
            var _a;
            return __awaiter$3(this, void 0, void 0, function* () {
                const tx = yield this.build();
                try {
                    const txid = yield this.provider.sendRawTransaction(tx);
                    return raw ? yield this.getTxDetails(txid, raw) : yield this.getTxDetails(txid);
                }
                catch (e) {
                    const reason = (_a = e.error) !== null && _a !== void 0 ? _a : e.message;
                    throw buildError(reason, meep(tx, this.inputs, this.redeemScript));
                }
            });
        }
        getTxDetails(txid, raw) {
            return __awaiter$3(this, void 0, void 0, function* () {
                for (let retries = 0; retries < 1200; retries += 1) {
                    yield delay_1(500);
                    try {
                        const hex = yield this.provider.getRawTransaction(txid);
                        if (raw)
                            return hex;
                        const libauthTransaction = decodeTransaction(hexToBin(hex));
                        return Object.assign(Object.assign({}, libauthTransaction), { txid, hex });
                    }
                    catch (ignored) {
                        // ignored
                    }
                }
                // Should not happen
                throw new Error('Could not retrieve transaction details for over 10 minutes');
            });
        }
        meep() {
            return __awaiter$3(this, void 0, void 0, function* () {
                const tx = yield this.build();
                return meep(tx, this.inputs, this.redeemScript);
            });
        }
        setInputsAndOutputs() {
            var _a;
            return __awaiter$3(this, void 0, void 0, function* () {
                if (this.outputs.length === 0) {
                    throw Error('Attempted to build a transaction without outputs');
                }
                // Replace all SignatureTemplate with 65-length placeholder Uint8Arrays
                const placeholderArgs = this.args.map((arg) => (arg instanceof SignatureTemplate ? placeholder(65) : arg));
                // Create a placeholder preimage of the correct size
                const placeholderPreimage = this.abiFunction.covenant
                    ? placeholder(getPreimageSize(scriptToBytecode(this.redeemScript)))
                    : undefined;
                // Create a placeholder input script for size calculation using the placeholder
                // arguments and correctly sized placeholder preimage
                const placeholderScript = createInputScript(this.redeemScript, placeholderArgs, this.selector, placeholderPreimage);
                // Add one extra byte per input to over-estimate tx-in count
                const inputSize = getInputSize(placeholderScript) + 1;
                // Calculate amount to send and base fee (excluding additional fees per UTXO)
                const amount = this.outputs.reduce((acc, output) => acc + output.amount, 0);
                let fee = (_a = this.hardcodedFee) !== null && _a !== void 0 ? _a : getTxSizeWithoutInputs(this.outputs) * this.feePerByte;
                // Select and gather UTXOs and calculate fees and available funds
                let satsAvailable = 0;
                if (this.inputs.length > 0) {
                    // If inputs are already defined, the user provided the UTXOs
                    // and we perform no further UTXO selection
                    if (!this.hardcodedFee)
                        fee += this.inputs.length * inputSize * this.feePerByte;
                    satsAvailable = this.inputs.reduce((acc, input) => acc + input.satoshis, 0);
                }
                else {
                    // If inputs are not defined yet, we retrieve the contract's UTXOs and perform selection
                    const utxos = yield this.provider.getUtxos(this.address);
                    // We sort the UTXOs mainly so there is consistent behaviour between network providers
                    // even if they report UTXOs in a different order
                    utxos.sort((a, b) => b.satoshis - a.satoshis);
                    for (const utxo of utxos) {
                        this.inputs.push(utxo);
                        satsAvailable += utxo.satoshis;
                        if (!this.hardcodedFee)
                            fee += inputSize * this.feePerByte;
                        if (satsAvailable > amount + fee)
                            break;
                    }
                }
                // Fee per byte can be a decimal number, but we need the total fee to be an integer
                fee = Math.ceil(fee);
                // Calculate change and check available funds
                let change = satsAvailable - amount - fee;
                if (change < 0) {
                    throw new Error(`Insufficient funds: available (${satsAvailable}) < needed (${amount + fee}).`);
                }
                // Account for the fee of a change output
                if (!this.hardcodedFee) {
                    change -= P2SH_OUTPUT_SIZE;
                }
                // Add a change output if applicable
                if (change >= DUST_LIMIT && change >= this.minChange) {
                    this.outputs.push({ to: this.address, amount: change });
                }
            });
        }
    }

    function encodeArgument(argument, typeStr) {
        let type = parseType(typeStr);
        if (type === PrimitiveType.BOOL) {
            if (typeof argument !== 'boolean') {
                throw new TypeError$1(typeof argument, type);
            }
            return encodeBool(argument);
        }
        if (type === PrimitiveType.INT) {
            if (typeof argument !== 'number' && typeof argument !== 'bigint') {
                throw new TypeError$1(typeof argument, type);
            }
            return encodeInt(argument);
        }
        if (type === PrimitiveType.STRING) {
            if (typeof argument !== 'string') {
                throw new TypeError$1(typeof argument, type);
            }
            return encodeString(argument);
        }
        if (type === PrimitiveType.SIG && argument instanceof SignatureTemplate)
            return argument;
        // Convert hex string to Uint8Array
        if (typeof argument === 'string') {
            if (argument.startsWith('0x')) {
                argument = argument.slice(2);
            }
            argument = hexToBin(argument);
        }
        if (!(argument instanceof Uint8Array)) {
            throw Error(`Value for type ${type} should be a Uint8Array or hex string`);
        }
        // Redefine SIG as a bytes65 so it is included in the size checks below
        // Note that ONLY Schnorr signatures are accepted
        if (type === PrimitiveType.SIG && argument.byteLength !== 0) {
            type = new BytesType(65);
        }
        // Redefine SIG as a bytes64 so it is included in the size checks below
        // Note that ONLY Schnorr signatures are accepted
        if (type === PrimitiveType.DATASIG && argument.byteLength !== 0) {
            type = new BytesType(64);
        }
        // Bounded bytes types require a correctly sized argument
        if (type instanceof BytesType && type.bound && argument.byteLength !== type.bound) {
            throw new TypeError$1(`bytes${argument.byteLength}`, type);
        }
        return argument;
    }

    // Copyright Joyent, Inc. and other Node contributors.

    var R = typeof Reflect === 'object' ? Reflect : null;
    var ReflectApply = R && typeof R.apply === 'function'
      ? R.apply
      : function ReflectApply(target, receiver, args) {
        return Function.prototype.apply.call(target, receiver, args);
      };

    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === 'function') {
      ReflectOwnKeys = R.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys(target) {
        return Object.getOwnPropertyNames(target)
          .concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys(target) {
        return Object.getOwnPropertyNames(target);
      };
    }

    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning);
    }

    var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
      return value !== value;
    };

    function EventEmitter() {
      EventEmitter.init.call(this);
    }
    var events = EventEmitter;
    var once_1 = once;

    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    var defaultMaxListeners = 10;

    function checkListener(listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }

    Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
        }
        defaultMaxListeners = arg;
      }
    });

    EventEmitter.init = function() {

      if (this._events === undefined ||
          this._events === Object.getPrototypeOf(this)._events) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
      }
      this._maxListeners = n;
      return this;
    };

    function _getMaxListeners(that) {
      if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };

    EventEmitter.prototype.emit = function emit(type) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      var doError = (type === 'error');

      var events = this._events;
      if (events !== undefined)
        doError = (doError && events.error === undefined);
      else if (!doError)
        return false;

      // If there is no 'error' event listener then throw.
      if (doError) {
        var er;
        if (args.length > 0)
          er = args[0];
        if (er instanceof Error) {
          // Note: The comments on the `throw` lines are intentional, they show
          // up in Node's output if this results in an unhandled exception.
          throw er; // Unhandled 'error' event
        }
        // At least give some kind of context to the user
        var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
        err.context = er;
        throw err; // Unhandled 'error' event
      }

      var handler = events[type];

      if (handler === undefined)
        return false;

      if (typeof handler === 'function') {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          ReflectApply(listeners[i], this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      checkListener(listener);

      events = target._events;
      if (events === undefined) {
        events = target._events = Object.create(null);
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener !== undefined) {
          target.emit('newListener', type,
                      listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (existing === undefined) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] =
            prepend ? [listener, existing] : [existing, listener];
          // If we've already got an array, just append.
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }

        // Check for listener leak
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true;
          // No error code for this since it is a Warning
          // eslint-disable-next-line no-restricted-syntax
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + String(type) + ' listeners ' +
                              'added. Use emitter.setMaxListeners() to ' +
                              'increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          ProcessEmitWarning(w);
        }
      }

      return target;
    }

    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }

    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          checkListener(listener);
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

    // Emits a 'removeListener' event if and only if the listener was removed.
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          checkListener(listener);

          events = this._events;
          if (events === undefined)
            return this;

          list = events[type];
          if (list === undefined)
            return this;

          if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0)
              this._events = Object.create(null);
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length - 1; i >= 0; i--) {
              if (list[i] === listener || list[i].listener === listener) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (position === 0)
              list.shift();
            else {
              spliceOne(list, position);
            }

            if (list.length === 1)
              events[type] = list[0];

            if (events.removeListener !== undefined)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };

    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events, i;

          events = this._events;
          if (events === undefined)
            return this;

          // not listening for removeListener, no need to emit
          if (events.removeListener === undefined) {
            if (arguments.length === 0) {
              this._events = Object.create(null);
              this._eventsCount = 0;
            } else if (events[type] !== undefined) {
              if (--this._eventsCount === 0)
                this._events = Object.create(null);
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;
            for (i = 0; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = Object.create(null);
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners !== undefined) {
            // LIFO order
            for (i = listeners.length - 1; i >= 0; i--) {
              this.removeListener(type, listeners[i]);
            }
          }

          return this;
        };

    function _listeners(target, type, unwrap) {
      var events = target._events;

      if (events === undefined)
        return [];

      var evlistener = events[type];
      if (evlistener === undefined)
        return [];

      if (typeof evlistener === 'function')
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];

      return unwrap ?
        unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }

    EventEmitter.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };

    EventEmitter.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };

    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events !== undefined) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener !== undefined) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };

    function arrayClone(arr, n) {
      var copy = new Array(n);
      for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
      return copy;
    }

    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    function once(emitter, name) {
      return new Promise(function (resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }

        function resolver() {
          if (typeof emitter.removeListener === 'function') {
            emitter.removeListener('error', errorListener);
          }
          resolve([].slice.call(arguments));
        }
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== 'error') {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }

    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === 'function') {
        eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
      }
    }

    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === 'function') {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === 'function') {
        // EventTarget does not have `error` event semantics like Node
        // EventEmitters, we do not listen for `error` events here.
        emitter.addEventListener(name, function wrapListener(arg) {
          // IE does not have builtin `{ once: true }` support so we
          // have to do it manually.
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }
    events.once = once_1;

    /**
     * Helpers.
     */
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse(val);
      } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'weeks':
        case 'week':
        case 'w':
          return n * w;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
      }
      return ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
    }

    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     */

    function setup(env) {
    	createDebug.debug = createDebug;
    	createDebug.default = createDebug;
    	createDebug.coerce = coerce;
    	createDebug.disable = disable;
    	createDebug.enable = enable;
    	createDebug.enabled = enabled;
    	createDebug.humanize = ms;
    	createDebug.destroy = destroy;

    	Object.keys(env).forEach(key => {
    		createDebug[key] = env[key];
    	});

    	/**
    	* The currently active debug mode names, and names to skip.
    	*/

    	createDebug.names = [];
    	createDebug.skips = [];

    	/**
    	* Map of special "%n" handling functions, for the debug "format" argument.
    	*
    	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
    	*/
    	createDebug.formatters = {};

    	/**
    	* Selects a color for a debug namespace
    	* @param {String} namespace The namespace string for the debug instance to be colored
    	* @return {Number|String} An ANSI color code for the given namespace
    	* @api private
    	*/
    	function selectColor(namespace) {
    		let hash = 0;

    		for (let i = 0; i < namespace.length; i++) {
    			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
    			hash |= 0; // Convert to 32bit integer
    		}

    		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    	}
    	createDebug.selectColor = selectColor;

    	/**
    	* Create a debugger with the given `namespace`.
    	*
    	* @param {String} namespace
    	* @return {Function}
    	* @api public
    	*/
    	function createDebug(namespace) {
    		let prevTime;
    		let enableOverride = null;
    		let namespacesCache;
    		let enabledCache;

    		function debug(...args) {
    			// Disabled?
    			if (!debug.enabled) {
    				return;
    			}

    			const self = debug;

    			// Set `diff` timestamp
    			const curr = Number(new Date());
    			const ms = curr - (prevTime || curr);
    			self.diff = ms;
    			self.prev = prevTime;
    			self.curr = curr;
    			prevTime = curr;

    			args[0] = createDebug.coerce(args[0]);

    			if (typeof args[0] !== 'string') {
    				// Anything else let's inspect with %O
    				args.unshift('%O');
    			}

    			// Apply any `formatters` transformations
    			let index = 0;
    			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
    				// If we encounter an escaped % then don't increase the array index
    				if (match === '%%') {
    					return '%';
    				}
    				index++;
    				const formatter = createDebug.formatters[format];
    				if (typeof formatter === 'function') {
    					const val = args[index];
    					match = formatter.call(self, val);

    					// Now we need to remove `args[index]` since it's inlined in the `format`
    					args.splice(index, 1);
    					index--;
    				}
    				return match;
    			});

    			// Apply env-specific formatting (colors, etc.)
    			createDebug.formatArgs.call(self, args);

    			const logFn = self.log || createDebug.log;
    			logFn.apply(self, args);
    		}

    		debug.namespace = namespace;
    		debug.useColors = createDebug.useColors();
    		debug.color = createDebug.selectColor(namespace);
    		debug.extend = extend;
    		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

    		Object.defineProperty(debug, 'enabled', {
    			enumerable: true,
    			configurable: false,
    			get: () => {
    				if (enableOverride !== null) {
    					return enableOverride;
    				}
    				if (namespacesCache !== createDebug.namespaces) {
    					namespacesCache = createDebug.namespaces;
    					enabledCache = createDebug.enabled(namespace);
    				}

    				return enabledCache;
    			},
    			set: v => {
    				enableOverride = v;
    			}
    		});

    		// Env-specific initialization logic for debug instances
    		if (typeof createDebug.init === 'function') {
    			createDebug.init(debug);
    		}

    		return debug;
    	}

    	function extend(namespace, delimiter) {
    		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    		newDebug.log = this.log;
    		return newDebug;
    	}

    	/**
    	* Enables a debug mode by namespaces. This can include modes
    	* separated by a colon and wildcards.
    	*
    	* @param {String} namespaces
    	* @api public
    	*/
    	function enable(namespaces) {
    		createDebug.save(namespaces);
    		createDebug.namespaces = namespaces;

    		createDebug.names = [];
    		createDebug.skips = [];

    		let i;
    		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    		const len = split.length;

    		for (i = 0; i < len; i++) {
    			if (!split[i]) {
    				// ignore empty strings
    				continue;
    			}

    			namespaces = split[i].replace(/\*/g, '.*?');

    			if (namespaces[0] === '-') {
    				createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
    			} else {
    				createDebug.names.push(new RegExp('^' + namespaces + '$'));
    			}
    		}
    	}

    	/**
    	* Disable debug output.
    	*
    	* @return {String} namespaces
    	* @api public
    	*/
    	function disable() {
    		const namespaces = [
    			...createDebug.names.map(toNamespace),
    			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
    		].join(',');
    		createDebug.enable('');
    		return namespaces;
    	}

    	/**
    	* Returns true if the given mode name is enabled, false otherwise.
    	*
    	* @param {String} name
    	* @return {Boolean}
    	* @api public
    	*/
    	function enabled(name) {
    		if (name[name.length - 1] === '*') {
    			return true;
    		}

    		let i;
    		let len;

    		for (i = 0, len = createDebug.skips.length; i < len; i++) {
    			if (createDebug.skips[i].test(name)) {
    				return false;
    			}
    		}

    		for (i = 0, len = createDebug.names.length; i < len; i++) {
    			if (createDebug.names[i].test(name)) {
    				return true;
    			}
    		}

    		return false;
    	}

    	/**
    	* Convert regexp to namespace
    	*
    	* @param {RegExp} regxep
    	* @return {String} namespace
    	* @api private
    	*/
    	function toNamespace(regexp) {
    		return regexp.toString()
    			.substring(2, regexp.toString().length - 2)
    			.replace(/\.\*\?$/, '*');
    	}

    	/**
    	* Coerce `val`.
    	*
    	* @param {Mixed} val
    	* @return {Mixed}
    	* @api private
    	*/
    	function coerce(val) {
    		if (val instanceof Error) {
    			return val.stack || val.message;
    		}
    		return val;
    	}

    	/**
    	* XXX DO NOT USE. This is a temporary stub function.
    	* XXX It WILL be removed in the next major release.
    	*/
    	function destroy() {
    		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    	}

    	createDebug.enable(createDebug.load());

    	return createDebug;
    }

    var common = setup;

    /* eslint-env browser */

    var browser$1 = createCommonjsModule(function (module, exports) {
    /**
     * This is the web browser implementation of `debug()`.
     */

    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = (() => {
    	let warned = false;

    	return () => {
    		if (!warned) {
    			warned = true;
    			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    		}
    	};
    })();

    /**
     * Colors.
     */

    exports.colors = [
    	'#0000CC',
    	'#0000FF',
    	'#0033CC',
    	'#0033FF',
    	'#0066CC',
    	'#0066FF',
    	'#0099CC',
    	'#0099FF',
    	'#00CC00',
    	'#00CC33',
    	'#00CC66',
    	'#00CC99',
    	'#00CCCC',
    	'#00CCFF',
    	'#3300CC',
    	'#3300FF',
    	'#3333CC',
    	'#3333FF',
    	'#3366CC',
    	'#3366FF',
    	'#3399CC',
    	'#3399FF',
    	'#33CC00',
    	'#33CC33',
    	'#33CC66',
    	'#33CC99',
    	'#33CCCC',
    	'#33CCFF',
    	'#6600CC',
    	'#6600FF',
    	'#6633CC',
    	'#6633FF',
    	'#66CC00',
    	'#66CC33',
    	'#9900CC',
    	'#9900FF',
    	'#9933CC',
    	'#9933FF',
    	'#99CC00',
    	'#99CC33',
    	'#CC0000',
    	'#CC0033',
    	'#CC0066',
    	'#CC0099',
    	'#CC00CC',
    	'#CC00FF',
    	'#CC3300',
    	'#CC3333',
    	'#CC3366',
    	'#CC3399',
    	'#CC33CC',
    	'#CC33FF',
    	'#CC6600',
    	'#CC6633',
    	'#CC9900',
    	'#CC9933',
    	'#CCCC00',
    	'#CCCC33',
    	'#FF0000',
    	'#FF0033',
    	'#FF0066',
    	'#FF0099',
    	'#FF00CC',
    	'#FF00FF',
    	'#FF3300',
    	'#FF3333',
    	'#FF3366',
    	'#FF3399',
    	'#FF33CC',
    	'#FF33FF',
    	'#FF6600',
    	'#FF6633',
    	'#FF9900',
    	'#FF9933',
    	'#FFCC00',
    	'#FFCC33'
    ];

    /**
     * Currently only WebKit-based Web Inspectors, Firefox >= v31,
     * and the Firebug extension (any Firefox version) are known
     * to support "%c" CSS customizations.
     *
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */

    // eslint-disable-next-line complexity
    function useColors() {
    	// NB: In an Electron preload script, document will be defined but not fully
    	// initialized. Since we know we're in Chrome, we'll just detect this case
    	// explicitly
    	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    		return true;
    	}

    	// Internet Explorer and Edge do not support colors.
    	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    		return false;
    	}

    	// Is webkit? http://stackoverflow.com/a/16459606/376773
    	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    		// Is firebug? http://stackoverflow.com/a/398120/376773
    		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    		// Is firefox >= v31?
    		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    		// Double check webkit in userAgent just in case we are in a worker
    		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }

    /**
     * Colorize log arguments if enabled.
     *
     * @api public
     */

    function formatArgs(args) {
    	args[0] = (this.useColors ? '%c' : '') +
    		this.namespace +
    		(this.useColors ? ' %c' : ' ') +
    		args[0] +
    		(this.useColors ? '%c ' : ' ') +
    		'+' + module.exports.humanize(this.diff);

    	if (!this.useColors) {
    		return;
    	}

    	const c = 'color: ' + this.color;
    	args.splice(1, 0, c, 'color: inherit');

    	// The final "%c" is somewhat tricky, because there could be other
    	// arguments passed either before or after the %c, so we need to
    	// figure out the correct index to insert the CSS into
    	let index = 0;
    	let lastC = 0;
    	args[0].replace(/%[a-zA-Z%]/g, match => {
    		if (match === '%%') {
    			return;
    		}
    		index++;
    		if (match === '%c') {
    			// We only are interested in the *last* %c
    			// (the user may have provided their own)
    			lastC = index;
    		}
    	});

    	args.splice(lastC, 0, c);
    }

    /**
     * Invokes `console.debug()` when available.
     * No-op when `console.debug` is not a "function".
     * If `console.debug` is not available, falls back
     * to `console.log`.
     *
     * @api public
     */
    exports.log = console.debug || console.log || (() => {});

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */
    function save(namespaces) {
    	try {
    		if (namespaces) {
    			exports.storage.setItem('debug', namespaces);
    		} else {
    			exports.storage.removeItem('debug');
    		}
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}
    }

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */
    function load() {
    	let r;
    	try {
    		r = exports.storage.getItem('debug');
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}

    	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    	if (!r && typeof process !== 'undefined' && 'env' in process) {
    		r = process.env.DEBUG;
    	}

    	return r;
    }

    /**
     * Localstorage attempts to return the localstorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/localstorage
     * and you attempt to access it.
     *
     * @return {LocalStorage}
     * @api private
     */

    function localstorage() {
    	try {
    		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    		// The Browser also has localStorage in the global context.
    		return localStorage;
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}
    }

    module.exports = common(exports);

    const {formatters} = module.exports;

    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */

    formatters.j = function (v) {
    	try {
    		return JSON.stringify(v);
    	} catch (error) {
    		return '[UnexpectedJSONParseError]: ' + error.message;
    	}
    };
    });

    // https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

    var ws = null;

    if (typeof WebSocket !== 'undefined') {
      ws = WebSocket;
    } else if (typeof MozWebSocket !== 'undefined') {
      ws = MozWebSocket;
    } else if (typeof commonjsGlobal !== 'undefined') {
      ws = commonjsGlobal.WebSocket || commonjsGlobal.MozWebSocket;
    } else if (typeof window !== 'undefined') {
      ws = window.WebSocket || window.MozWebSocket;
    } else if (typeof self !== 'undefined') {
      ws = self.WebSocket || self.MozWebSocket;
    }

    var browser = ws;

    const E_CANCELED = new Error('request for lock canceled');

    var __awaiter$2 = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class Semaphore {
        constructor(_maxConcurrency, _cancelError = E_CANCELED) {
            this._maxConcurrency = _maxConcurrency;
            this._cancelError = _cancelError;
            this._queue = [];
            this._waiters = [];
            if (_maxConcurrency <= 0) {
                throw new Error('semaphore must be initialized to a positive value');
            }
            this._value = _maxConcurrency;
        }
        acquire() {
            const locked = this.isLocked();
            const ticketPromise = new Promise((resolve, reject) => this._queue.push({ resolve, reject }));
            if (!locked)
                this._dispatch();
            return ticketPromise;
        }
        runExclusive(callback) {
            return __awaiter$2(this, void 0, void 0, function* () {
                const [value, release] = yield this.acquire();
                try {
                    return yield callback(value);
                }
                finally {
                    release();
                }
            });
        }
        waitForUnlock() {
            return __awaiter$2(this, void 0, void 0, function* () {
                if (!this.isLocked()) {
                    return Promise.resolve();
                }
                const waitPromise = new Promise((resolve) => this._waiters.push({ resolve }));
                return waitPromise;
            });
        }
        isLocked() {
            return this._value <= 0;
        }
        /** @deprecated Deprecated in 0.3.0, will be removed in 0.4.0. Use runExclusive instead. */
        release() {
            if (this._maxConcurrency > 1) {
                throw new Error('this method is unavailable on semaphores with concurrency > 1; use the scoped release returned by acquire instead');
            }
            if (this._currentReleaser) {
                const releaser = this._currentReleaser;
                this._currentReleaser = undefined;
                releaser();
            }
        }
        cancel() {
            this._queue.forEach((ticket) => ticket.reject(this._cancelError));
            this._queue = [];
        }
        _dispatch() {
            const nextTicket = this._queue.shift();
            if (!nextTicket)
                return;
            let released = false;
            this._currentReleaser = () => {
                if (released)
                    return;
                released = true;
                this._value++;
                this._resolveWaiters();
                this._dispatch();
            };
            nextTicket.resolve([this._value--, this._currentReleaser]);
        }
        _resolveWaiters() {
            this._waiters.forEach((waiter) => waiter.resolve());
            this._waiters = [];
        }
    }

    var __awaiter$1$1 = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class Mutex {
        constructor(cancelError) {
            this._semaphore = new Semaphore(1, cancelError);
        }
        acquire() {
            return __awaiter$1$1(this, void 0, void 0, function* () {
                const [, releaser] = yield this._semaphore.acquire();
                return releaser;
            });
        }
        runExclusive(callback) {
            return this._semaphore.runExclusive(() => callback());
        }
        isLocked() {
            return this._semaphore.isLocked();
        }
        waitForUnlock() {
            return this._semaphore.waitForUnlock();
        }
        /** @deprecated Deprecated in 0.3.0, will be removed in 0.4.0. Use runExclusive instead. */
        release() {
            this._semaphore.release();
        }
        cancel() {
            return this._semaphore.cancel();
        }
    }

    // Create the debug logs.
    const debug = {
        client: browser$1.debug('electrum-cash:client '),
        cluster: browser$1.debug('electrum-cash:cluster'),
        errors: browser$1.debug('electrum-cash:error  '),
        warning: browser$1.debug('electrum-cash:warning'),
        network: browser$1.debug('electrum-cash:network'),
        ping: browser$1.debug('electrum-cash:pulses '),
    };
    // Set log colors.
    debug.client.color = '2';
    debug.cluster.color = '3';
    debug.errors.color = '9';
    debug.warning.color = '13';
    debug.network.color = '4';
    debug.ping.color = '8';

    /**
     * Grouping of utilities that simplifies implementation of the Electrum protocol.
     *
     * @ignore
     */
    class ElectrumProtocol {
        /**
         * Helper function that builds an Electrum request object.
         *
         * @param {string} method       method to call.
         * @param {array}  parameters   method parameters for the call.
         * @param {string} requestId    unique string or number referencing this request.
         *
         * @returns a properly formatted Electrum request string.
         */
        static buildRequestObject(method, parameters, requestId) {
            // Return the formatted request object.
            // NOTE: Electrum either uses JsonRPC strictly or loosely.
            //       If we specify protocol identifier without being 100% compliant, we risk being disconnected/blacklisted.
            //       For this reason, we omit the protocol identifier to avoid issues.
            return JSON.stringify({ method: method, params: parameters, id: requestId });
        }
        /**
         * Constant used to verify if a provided string is a valid version number.
         *
         * @returns a regular expression that matches valid version numbers.
         */
        static get versionRegexp() {
            return /^\d+(\.\d+)+$/;
        }
        /**
         * Constant used to separate statements/messages in a stream of data.
         *
         * @returns the delimiter used by Electrum to separate statements.
         */
        static get statementDelimiter() {
            return '\n';
        }
    }

    const isVersionRejected = function (object) {
        return 'error' in object;
    };

    // Disable indent rule for this file because it is broken (https://github.com/typescript-eslint/typescript-eslint/issues/1824)
    /* eslint-disable @typescript-eslint/indent */
    /**
     * Enum that denotes the ordering to use in an ElectrumCluster.
     * @enum {number}
     * @property {0} RANDOM     Send requests to randomly selected servers in the cluster.
     * @property {1} PRIORITY   Send requests to servers in the cluster in the order they were added.
     */
    var ClusterOrder;
    (function (ClusterOrder) {
        ClusterOrder[ClusterOrder["RANDOM"] = 0] = "RANDOM";
        ClusterOrder[ClusterOrder["PRIORITY"] = 1] = "PRIORITY";
    })(ClusterOrder || (ClusterOrder = {}));
    /**
     * Enum that denotes the distribution setting to use in an ElectrumCluster.
     * @enum {number}
     * @property {0} ALL   Send requests to all servers in the cluster.
     */
    var ClusterDistribution;
    (function (ClusterDistribution) {
        ClusterDistribution[ClusterDistribution["ALL"] = 0] = "ALL";
    })(ClusterDistribution || (ClusterDistribution = {}));
    /**
     * Enum that denotes the ready status of an ElectrumCluster.
     * @enum {number}
     * @property {0} DISABLED    The cluster is disabled and unusable.
     * @property {1} DEGRADED    The cluster is degraded but still usable.
     * @property {2} READY       The cluster is healthy and ready for use.
     */
    var ClusterStatus;
    (function (ClusterStatus) {
        ClusterStatus[ClusterStatus["DISABLED"] = 0] = "DISABLED";
        ClusterStatus[ClusterStatus["DEGRADED"] = 1] = "DEGRADED";
        ClusterStatus[ClusterStatus["READY"] = 2] = "READY";
    })(ClusterStatus || (ClusterStatus = {}));
    /**
     * Enum that denotes the availability of an ElectrumClient.
     * @enum {number}
     * @property {0} UNAVAILABLE   The client is currently not available.
     * @property {1} AVAILABLE     The client is available for use.
     */
    var ClientState;
    (function (ClientState) {
        ClientState[ClientState["UNAVAILABLE"] = 0] = "UNAVAILABLE";
        ClientState[ClientState["AVAILABLE"] = 1] = "AVAILABLE";
    })(ClientState || (ClientState = {}));
    /**
     * Enum that denotes the connection status of an ElectrumConnection.
     * @enum {number}
     * @property {0} DISCONNECTED    The connection is disconnected.
     * @property {1} AVAILABLE       The connection is connected.
     * @property {2} DISCONNECTING   The connection is disconnecting.
     * @property {3} CONNECTING      The connection is connecting.
     * @property {4} RECONNECTING    The connection is restarting.
     */
    var ConnectionStatus;
    (function (ConnectionStatus) {
        ConnectionStatus[ConnectionStatus["DISCONNECTED"] = 0] = "DISCONNECTED";
        ConnectionStatus[ConnectionStatus["CONNECTED"] = 1] = "CONNECTED";
        ConnectionStatus[ConnectionStatus["DISCONNECTING"] = 2] = "DISCONNECTING";
        ConnectionStatus[ConnectionStatus["CONNECTING"] = 3] = "CONNECTING";
        ConnectionStatus[ConnectionStatus["RECONNECTING"] = 4] = "RECONNECTING";
    })(ConnectionStatus || (ConnectionStatus = {}));

    /**
     * Object containing the commonly used ports and schemes for specific Transports.
     * @example const electrum = new ElectrumClient('Electrum client example', '1.4.1', 'bch.imaginary.cash', Transport.WSS.Port, Transport.WSS.Scheme);
     *
     * @property {object} TCP       Port and Scheme to use unencrypted TCP sockets.
     * @property {object} TCP_TLS   Port and Scheme to use TLS-encrypted TCP sockets.
     * @property {object} WS        Port and Scheme to use unencrypted WebSockets.
     * @property {object} WSS       Port and Scheme to use TLS-encrypted WebSockets.
     */
    const ElectrumTransport = {
        TCP: { Port: 50001, Scheme: 'tcp' },
        TCP_TLS: { Port: 50002, Scheme: 'tcp_tls' },
        WS: { Port: 50003, Scheme: 'ws' },
        WSS: { Port: 50004, Scheme: 'wss' },
    };
    const DefaultParameters = {
        // Port number for TCP TLS connections
        PORT: ElectrumTransport.TCP_TLS.Port,
        // Transport to connect to the Electrum server
        TRANSPORT_SCHEME: ElectrumTransport.TCP_TLS.Scheme,
        // How long to wait before attempting to reconnect, in milliseconds.
        RECONNECT: 15 * 1000,
        // How long to wait for network operations before following up, in milliseconds.
        TIMEOUT: 120 * 1000,
        // Time between ping messages, in milliseconds. Pinging keeps the connection alive.
        // The reason for pinging this frequently is to detect connection problems early.
        PING_INTERVAL: 3 * 1000,
        // How many servers are required before we trust information provided.
        CLUSTER_CONFIDENCE: 1,
        // How many servers we send requests to.
        CLUSTER_DISTRIBUTION: ClusterDistribution.ALL,
        // What order we select servers to send requests to.
        CLUSTER_ORDER: ClusterOrder.RANDOM,
    };

    /**
     * Isomorphic Socket interface supporting TCP sockets and WebSockets (Node and browser).
     * The interface is a subset of the TLSSocket interface with some slight modifications.
     * It can be expanded when more socket functionality is needed in the rest of the
     * electrum-cash code. Changes from the TLSSocket interface (besides it being a subset):
     * - Event 'close' -> 'disconnect'
     * - New function socket.disconnect()
     *
     * @ignore
     */
    class ElectrumSocket extends events.EventEmitter {
        // Declare an empty TCP socket.
        tcpSocket;
        // Declare an empty WebSocket.
        webSocket;
        // Declare timers for keep-alive pings and reconnection
        timers = {};
        // Initialize boolean that indicates whether the onConnect function has run (initialize to false).
        onConnectHasRun = false;
        // Initialize event forwarding functions.
        eventForwarders = {
            disconnect: () => this.emit('disconnect'),
            tcpData: (data) => this.emit('data', data),
            wsData: (event) => this.emit('data', `${event.data}\n`),
            tcpError: (err) => this.emit('error', err),
            wsError: (event) => this.emit('error', event.error),
        };
        /**
         * Connect to host:port using the specified transport
         *
         * @param {string} host              Fully qualified domain name or IP address of the host
         * @param {number} port              Network port for the host to connect to
         * @param {TransportScheme} scheme   Transport scheme to use
         * @param {number} timeout           If no connection is established after `timeout` ms, the connection is terminated
         *
         * @throws {Error} if an incorrect transport scheme is specified
         */
        connect(host, port, scheme, timeout) {
            // Check that no existing socket exists before initiating a new connection.
            if (this.tcpSocket || this.webSocket) {
                throw (new Error('Cannot initiate a new socket connection when an existing connection exists'));
            }
            // Set a timer to force disconnect after `timeout` seconds
            this.timers.disconnect = setTimeout(() => this.disconnectOnTimeout(host, port, timeout), timeout);
            // Remove the timer if a connection is successfully established
            this.once('connect', this.clearDisconnectTimerOnTimeout);
            // Define how to refer to the connection scheme in debug output.
            const socketTypes = {
                [ElectrumTransport.TCP.Scheme]: 'a TCP Socket',
                [ElectrumTransport.TCP_TLS.Scheme]: 'an encrypted TCP socket',
                [ElectrumTransport.WS.Scheme]: 'a WebSocket',
                [ElectrumTransport.WSS.Scheme]: 'an encrypted WebSocket',
            };
            // Log that we are trying to establish a connection.
            debug.network(`Initiating ${socketTypes[scheme]} connection to '${host}:${port}'.`);
            if (scheme === ElectrumTransport.TCP.Scheme || scheme === ElectrumTransport.TCP_TLS.Scheme) {
                if (scheme === ElectrumTransport.TCP_TLS.Scheme) {
                    // Initialize connection options.
                    const connectionOptions = { rejectUnauthorized: false };
                    // If the hostname is not an IP address..
                    if (!net__default["default"].isIP(host)) {
                        // Set the servername option which enables support for SNI.
                        // NOTE: SNI enables a server that hosts multiple domains to provide the appropriate TLS certificate.
                        connectionOptions.serverName = host;
                    }
                    // Initialize this.tcpSocket (allowing self-signed certificates).
                    this.tcpSocket = tls__default["default"].connect(port, host, connectionOptions);
                    // Add a 'secureConnect' listener that checks the authorization status of
                    // the socket, and logs a warning when it uses a self signed certificate.
                    this.tcpSocket.once('secureConnect', () => {
                        // Cannot happen, since this event callback *only* exists on TLSSocket
                        if (!(this.tcpSocket instanceof tls__default["default"].TLSSocket))
                            return;
                        // Force cast authorizationError from Error to string (through unknown)
                        // because it is incorrectly typed as an Error
                        const authorizationError = this.tcpSocket.authorizationError;
                        if (authorizationError === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
                            debug.warning(`Connection to ${host}:${port} uses a self-signed certificate`);
                        }
                    });
                    // Trigger successful connection events.
                    this.tcpSocket.on('secureConnect', this.onConnect.bind(this, socketTypes[scheme], host, port));
                }
                else {
                    // Initialize this.tcpSocket.
                    this.tcpSocket = net__default["default"].connect({ host, port });
                    // Trigger successful connection events.
                    this.tcpSocket.on('connect', this.onConnect.bind(this, socketTypes[scheme], host, port));
                }
                // Configure encoding.
                this.tcpSocket.setEncoding('utf8');
                // Enable persistent connections with an initial delay of 0.
                this.tcpSocket.setKeepAlive(true, 0);
                // Disable buffering of outgoing data.
                this.tcpSocket.setNoDelay(true);
                // Forward the encountered errors.
                this.tcpSocket.on('error', this.eventForwarders.tcpError);
            }
            else if (scheme === ElectrumTransport.WS.Scheme || scheme === ElectrumTransport.WSS.Scheme) {
                if (scheme === ElectrumTransport.WSS.Scheme) {
                    // Initialize this.webSocket (rejecting self-signed certificates).
                    // We reject self-signed certificates to match functionality of browsers.
                    this.webSocket = new browser(`wss://${host}:${port}`);
                }
                else {
                    // Initialize this.webSocket.
                    this.webSocket = new browser(`ws://${host}:${port}`);
                }
                // Trigger successful connection events.
                this.webSocket.addEventListener('open', this.onConnect.bind(this, socketTypes[scheme], host, port));
                // Forward the encountered errors.
                this.webSocket.addEventListener('error', this.eventForwarders.wsError);
            }
            else {
                // Throw an error if an incorrect transport is specified
                throw (new Error('Incorrect transport specified'));
            }
        }
        /**
         * Sets up forwarding of events related to the connection.
         *
         * @param {string} connectionType   Name of the connection/transport type, used for logging.
         * @param {string} host             Fully qualified domain name or IP address of the host
         * @param {number} port             Network port for the host to connect to
         */
        onConnect(connectionType, host, port) {
            // If the onConnect function has already run, do not execute it again.
            if (this.onConnectHasRun)
                return;
            // Log that the connection has been established.
            debug.network(`Established ${connectionType} connection with '${host}:${port}'.`);
            if (typeof this.tcpSocket !== 'undefined') {
                // Forward the socket events
                this.tcpSocket.addListener('close', this.eventForwarders.disconnect);
                this.tcpSocket.addListener('data', this.eventForwarders.tcpData);
            }
            else if (typeof this.webSocket !== 'undefined') {
                // Forward the socket events
                this.webSocket.addEventListener('close', this.eventForwarders.disconnect);
                this.webSocket.addEventListener('message', this.eventForwarders.wsData);
            }
            // Indicate that the onConnect function has run.
            this.onConnectHasRun = true;
            // Emit the connect event.
            this.emit('connect');
        }
        /**
         * Clears the disconnect timer if it is still active.
         */
        clearDisconnectTimerOnTimeout() {
            // Clear the retry timer if it is still active.
            if (this.timers.disconnect) {
                clearTimeout(this.timers.disconnect);
            }
        }
        /**
         * Forcibly terminate the connection.
         *
         * @throws {Error} if no connection was found
         */
        disconnect() {
            // Clear the disconnect timer so that the socket does not try to disconnect again later.
            this.clearDisconnectTimerOnTimeout();
            // Handle disconnect based differently depending on socket type.
            if (this.tcpSocket) {
                // Remove all event forwarders.
                this.tcpSocket.removeListener('close', this.eventForwarders.disconnect);
                this.tcpSocket.removeListener('data', this.eventForwarders.tcpData);
                this.tcpSocket.removeListener('error', this.eventForwarders.tcpError);
                // Terminate the connection.
                this.tcpSocket.destroy();
                // Remove the stored socket.
                this.tcpSocket = undefined;
            }
            else if (this.webSocket) {
                try {
                    // Remove all event forwarders.
                    this.webSocket.removeEventListener('close', this.eventForwarders.disconnect);
                    this.webSocket.removeEventListener('message', this.eventForwarders.wsData);
                    this.webSocket.removeEventListener('error', this.eventForwarders.wsError);
                    // Gracefully terminate the connection.
                    this.webSocket.close();
                }
                catch (ignored) {
                    // close() will throw an error if the connection has not been established yet.
                    // We ignore this error, since no similar error gets thrown in the TLS Socket.
                }
                finally {
                    // Remove the stored socket regardless of any thrown errors.
                    this.webSocket = undefined;
                }
            }
            // Indicate that the onConnect function has not run and it has to be run again.
            this.onConnectHasRun = false;
            // Emit a disconnect event
            this.emit('disconnect');
        }
        /**
         * Write data to the socket
         *
         * @param {Uint8Array | string} data   Data to be written to the socket
         * @param {function} callback          Callback function to be called when the write has completed
         *
         * @throws {Error} if no connection was found
         * @returns true if the message was fully flushed to the socket, false if part of the message
         * is queued in the user memory
         */
        write(data, callback) {
            if (this.tcpSocket) {
                // Write data to the TLS Socket and return the status indicating whether the
                // full message was flushed to the socket
                return this.tcpSocket.write(data, callback);
            }
            if (this.webSocket) {
                // Write data to the WebSocket
                this.webSocket.send(data, callback);
                // WebSockets always fit everything in a single request, so we return true
                return true;
            }
            // Throw an error if no active connection is found
            throw (new Error('Cannot write to socket when there is no active connection'));
        }
        /**
         * Force a disconnection if no connection is established after `timeout` milliseconds.
         *
         * @param {string} host      Host of the connection that timed out
         * @param {number} port      Port of the connection that timed out
         * @param {number} timeout   Elapsed milliseconds
         */
        disconnectOnTimeout(host, port, timeout) {
            // Remove the connect listener.
            this.removeListener('connect', this.clearDisconnectTimerOnTimeout);
            // Create a new timeout error.
            const timeoutError = { code: 'ETIMEDOUT', message: `Connection to '${host}:${port}' timed out after ${timeout} milliseconds` };
            // Emit an error event so that connect is rejected upstream.
            this.emit('error', timeoutError);
            // Forcibly disconnect to clean up the connection on timeout
            this.disconnect();
        }
    }

    /**
     * Wrapper around TLS/WSS sockets that gracefully separates a network stream into Electrum protocol messages.
     *
     * @ignore
     */
    class ElectrumConnection extends events.EventEmitter {
        application;
        version;
        host;
        port;
        scheme;
        timeout;
        pingInterval;
        // Declare an empty socket.
        socket;
        // Declare empty timestamps
        lastReceivedTimestamp;
        // Declare timers for keep-alive pings and reconnection
        timers = {};
        // Initialize an empty array of connection verification timers.
        // eslint-disable-next-line no-undef
        verifications = [];
        // Initialize the connected flag to false to indicate that there is no connection
        status = ConnectionStatus.DISCONNECTED;
        // Initialize messageBuffer to an empty string
        messageBuffer = '';
        /**
         * Sets up network configuration for an Electrum client connection.
         *
         * @param {string} application       your application name, used to identify to the electrum host.
         * @param {string} version           protocol version to use with the host.
         * @param {string} host              fully qualified domain name or IP number of the host.
         * @param {number} port              the network port of the host.
         * @param {TransportScheme} scheme   the transport scheme to use for connection
         * @param {number} timeout           how long network delays we will wait for before taking action, in milliseconds.
         * @param {number} pingInterval      the time between sending pings to the electrum host, in milliseconds.
         *
         * @throws {Error} if `version` is not a valid version string.
         */
        constructor(application, version, host, port = DefaultParameters.PORT, scheme = DefaultParameters.TRANSPORT_SCHEME, timeout = DefaultParameters.TIMEOUT, pingInterval = DefaultParameters.PING_INTERVAL) {
            // Initialize the event emitter.
            super();
            this.application = application;
            this.version = version;
            this.host = host;
            this.port = port;
            this.scheme = scheme;
            this.timeout = timeout;
            this.pingInterval = pingInterval;
            // Check if the provided version is a valid version number.
            if (!ElectrumProtocol.versionRegexp.test(version)) {
                // Throw an error since the version number was not valid.
                throw (new Error(`Provided version string (${version}) is not a valid protocol version number.`));
            }
            // Create an initial network socket.
            this.createSocket();
        }
        /**
         * Returns a string for the host identifier for usage in debug messages.
         */
        get hostIdentifier() {
            return `${this.host}:${this.port}`;
        }
        /**
         * Create and configures a fresh socket and attaches all relevant listeners.
         */
        createSocket() {
            // Initialize a new ElectrumSocket
            this.socket = new ElectrumSocket();
            // Set up handlers for connection and disconnection.
            this.socket.on('connect', this.onSocketConnect.bind(this));
            this.socket.on('disconnect', this.onSocketDisconnect.bind(this));
            // Set up handler for incoming data.
            this.socket.on('data', this.parseMessageChunk.bind(this));
        }
        /**
         * Shuts down and destroys the current socket.
         */
        destroySocket() {
            // Close the socket connection and destroy the socket.
            this.socket.disconnect();
        }
        /**
         * Assembles incoming data into statements and hands them off to the message parser.
         *
         * @param {string} data   data to append to the current message buffer, as a string.
         *
         * @throws {SyntaxError} if the passed statement parts are not valid JSON.
         */
        parseMessageChunk(data) {
            // Update the timestamp for when we last received data.
            this.lastReceivedTimestamp = Date.now();
            // Clear and remove all verification timers.
            this.verifications.forEach((timer) => clearTimeout(timer));
            this.verifications.length = 0;
            // Add the message to the current message buffer.
            this.messageBuffer += data;
            // Check if the new message buffer contains the statement delimiter.
            while (this.messageBuffer.includes(ElectrumProtocol.statementDelimiter)) {
                // Split message buffer into statements.
                const statementParts = this.messageBuffer.split(ElectrumProtocol.statementDelimiter);
                // For as long as we still have statements to parse..
                while (statementParts.length > 1) {
                    // Move the first statement to its own variable.
                    const currentStatementList = String(statementParts.shift());
                    // Parse the statement into an object or list of objects.
                    let statementList = JSON.parse(currentStatementList);
                    // Wrap the statement in an array if it is not already a batched statement list.
                    if (!Array.isArray(statementList)) {
                        statementList = [statementList];
                    }
                    // For as long as there is statements in the result set..
                    while (statementList.length > 0) {
                        // Move the first statement from the batch to its own variable.
                        const currentStatement = statementList.shift();
                        // If the current statement is a version negotiation response..
                        if (currentStatement.id === 'versionNegotiation') {
                            if (currentStatement.error) {
                                // Then emit a failed version negotiation response signal.
                                this.emit('version', { error: currentStatement.error });
                            }
                            else {
                                // Emit a successful version negotiation response signal.
                                this.emit('version', { software: currentStatement.result[0], protocol: currentStatement.result[1] });
                            }
                            // Consider this statement handled.
                            continue;
                        }
                        // If the current statement is a keep-alive response..
                        if (currentStatement.id === 'keepAlive') {
                            // Do nothing and consider this statement handled.
                            continue;
                        }
                        // Emit the statements for handling higher up in the stack.
                        this.emit('statement', currentStatement);
                    }
                }
                // Store the remaining statement as the current message buffer.
                this.messageBuffer = statementParts.shift() || '';
            }
        }
        /**
         * Sends a keep-alive message to the host.
         *
         * @returns true if the ping message was fully flushed to the socket, false if
         * part of the message is queued in the user memory
         */
        ping() {
            // Write a log message.
            debug.ping(`Sending keep-alive ping to '${this.hostIdentifier}'`);
            // Craft a keep-alive message.
            const message = ElectrumProtocol.buildRequestObject('server.ping', [], 'keepAlive');
            // Send the keep-alive message.
            const status = this.send(message);
            // Return the ping status.
            return status;
        }
        /**
         * Initiates the network connection negotiates a protocol version. Also emits the 'connect' signal if successful.
         *
         * @throws {Error} if the socket connection fails.
         * @returns a promise resolving when the connection is established
         */
        async connect() {
            // If we are already connected return true.
            if (this.status === ConnectionStatus.CONNECTED) {
                return;
            }
            // Indicate that the connection is connecting
            this.status = ConnectionStatus.CONNECTING;
            // Define a function to wrap connection as a promise.
            const connectionResolver = (resolve, reject) => {
                const rejector = (error) => {
                    // Set the status back to disconnected
                    this.status = ConnectionStatus.DISCONNECTED;
                    // Reject with the error as reason
                    reject(error);
                };
                // Replace previous error handlers to reject the promise on failure.
                this.socket.removeAllListeners('error');
                this.socket.once('error', rejector);
                // Define a function to wrap version negotiation as a callback.
                const versionNegotiator = () => {
                    // Write a log message to show that we have started version negotiation.
                    debug.network(`Requesting protocol version ${this.version} with '${this.hostIdentifier}'.`);
                    // remove the one-time error handler since no error was detected.
                    this.socket.removeListener('error', rejector);
                    // Build a version negotiation message.
                    const versionMessage = ElectrumProtocol.buildRequestObject('server.version', [this.application, this.version], 'versionNegotiation');
                    // Define a function to wrap version validation as a function.
                    const versionValidator = (version) => {
                        // Check if version negotiation failed.
                        if (isVersionRejected(version)) {
                            // Disconnect from the host.
                            this.disconnect(true);
                            // Declare an error message.
                            const errorMessage = 'unsupported protocol version.';
                            // Log the error.
                            debug.errors(`Failed to connect with ${this.hostIdentifier} due to ${errorMessage}`);
                            // Reject the connection with false since version negotiation failed.
                            reject(errorMessage);
                        }
                        // Check if the host supports our requested protocol version.
                        else if (version.protocol !== this.version) {
                            // Disconnect from the host.
                            this.disconnect(true);
                            // Declare an error message.
                            const errorMessage = `incompatible protocol version negotiated (${version.protocol} !== ${this.version}).`;
                            // Log the error.
                            debug.errors(`Failed to connect with ${this.hostIdentifier} due to ${errorMessage}`);
                            // Reject the connection with false since version negotiation failed.
                            reject(errorMessage);
                        }
                        else {
                            // Write a log message.
                            debug.network(`Negotiated protocol version ${version.protocol} with '${this.hostIdentifier}', powered by ${version.software}.`);
                            // Set connection status to connected
                            this.status = ConnectionStatus.CONNECTED;
                            // Emit a connect event now that the connection is usable.
                            this.emit('connect');
                            // Resolve the connection promise since we successfully connected and negotiated protocol version.
                            resolve();
                        }
                    };
                    // Listen for version negotiation once.
                    this.once('version', versionValidator);
                    // Send the version negotiation message.
                    this.send(versionMessage);
                };
                // Prepare the version negotiation.
                this.socket.once('connect', versionNegotiator);
                // Set up handler for network errors.
                this.socket.on('error', this.onSocketError.bind(this));
                // Connect to the server.
                this.socket.connect(this.host, this.port, this.scheme, this.timeout);
            };
            // Wait until connection is established and version negotiation succeeds.
            await new Promise(connectionResolver);
        }
        /**
         * Restores the network connection.
         */
        async reconnect() {
            // If a reconnect timer is set, remove it
            await this.clearReconnectTimer();
            // Write a log message.
            debug.network(`Trying to reconnect to '${this.hostIdentifier}'..`);
            // Set the status to reconnecting for more accurate log messages.
            this.status = ConnectionStatus.RECONNECTING;
            // Destroy and recreate the socket to get a clean slate.
            this.destroySocket();
            this.createSocket();
            try {
                // Try to connect again.
                await this.connect();
            }
            catch (error) {
                // Do nothing as the error should be handled via the disconnect and error signals.
            }
        }
        /**
         * Removes the current reconnect timer.
         */
        clearReconnectTimer() {
            // If a reconnect timer is set, remove it
            if (this.timers.reconnect) {
                clearTimeout(this.timers.reconnect);
            }
            // Reset the timer reference.
            this.timers.reconnect = undefined;
        }
        /**
         * Removes the current keep-alive timer.
         */
        clearKeepAliveTimer() {
            // If a keep-alive timer is set, remove it
            if (this.timers.keepAlive) {
                clearTimeout(this.timers.keepAlive);
            }
            // Reset the timer reference.
            this.timers.keepAlive = undefined;
        }
        /**
         * Initializes the keep alive timer loop.
         */
        setupKeepAliveTimer() {
            // If the keep-alive timer loop is not currently set up..
            if (!this.timers.keepAlive) {
                // Set a new keep-alive timer.
                this.timers.keepAlive = setTimeout(this.ping.bind(this), this.pingInterval);
            }
        }
        /**
         * Tears down the current connection and removes all event listeners on disconnect.
         *
         * @param {boolean} force   disconnect even if the connection has not been fully established yet.
         *
         * @returns true if successfully disconnected, or false if there was no connection.
         */
        async disconnect(force = false) {
            // Return early when there is nothing to disconnect from
            if (this.status === ConnectionStatus.DISCONNECTED && !force) {
                // Return false to indicate that there was nothing to disconnect from.
                return false;
            }
            // Set connection status to null to indicate tear-down is currently happening.
            this.status = ConnectionStatus.DISCONNECTING;
            // If a keep-alive timer is set, remove it.
            await this.clearKeepAliveTimer();
            // If a reconnect timer is set, remove it
            await this.clearReconnectTimer();
            const disconnectResolver = (resolve) => {
                // Resolve to true after the connection emits a disconnect
                this.once('disconnect', () => resolve(true));
                // Close the connection and destroy the socket.
                this.destroySocket();
            };
            // Return true to indicate that we disconnected.
            return new Promise(disconnectResolver);
        }
        /**
         * Sends an arbitrary message to the server.
         *
         * @param {string} message   json encoded request object to send to the server, as a string.
         *
         * @returns true if the message was fully flushed to the socket, false if part of the message
         * is queued in the user memory
         */
        send(message) {
            // Remove the current keep-alive timer if it exists.
            this.clearKeepAliveTimer();
            // Get the current timestamp in milliseconds.
            const currentTime = Date.now();
            // Follow up and verify that the message got sent..
            const verificationTimer = setTimeout(this.verifySend.bind(this, currentTime), this.timeout);
            // Store the verification timer locally so that it can be cleared when data has been received.
            this.verifications.push(verificationTimer);
            // Set a new keep-alive timer.
            this.setupKeepAliveTimer();
            // Write the message to the network socket.
            return this.socket.write(message + ElectrumProtocol.statementDelimiter);
        }
        // --- Event managers. --- //
        /**
         * Marks the connection as timed out and schedules reconnection if we have not
         * received data within the expected time frame.
         */
        verifySend(sentTimestamp) {
            // If we haven't received any data since we last sent data out..
            if (Number(this.lastReceivedTimestamp) < sentTimestamp) {
                // If this connection is already disconnected, we do not change anything
                if ((this.status === ConnectionStatus.DISCONNECTED) || (this.status === ConnectionStatus.DISCONNECTING)) {
                    debug.errors(`Tried to verify already disconnected connection to '${this.hostIdentifier}'`);
                    return;
                }
                // Remove the current keep-alive timer if it exists.
                this.clearKeepAliveTimer();
                // Write a notification to the logs.
                debug.network(`Connection to '${this.hostIdentifier}' timed out.`);
                // Close the connection to avoid re-use.
                // NOTE: This initiates reconnection routines if the connection has not
                //       been marked as intentionally disconnected.
                this.socket.disconnect();
            }
        }
        /**
         * Updates the connection status when a connection is confirmed.
         */
        onSocketConnect() {
            // If a reconnect timer is set, remove it.
            this.clearReconnectTimer();
            // Set up the initial timestamp for when we last received data from the server.
            this.lastReceivedTimestamp = Date.now();
            // Set up the initial keep-alive timer.
            this.setupKeepAliveTimer();
            // Clear all temporary error listeners.
            this.socket.removeAllListeners('error');
            // Set up handler for network errors.
            this.socket.on('error', this.onSocketError.bind(this));
        }
        /**
         * Updates the connection status when a connection is ended.
         */
        onSocketDisconnect() {
            // Send a disconnect signal higher up the stack.
            this.emit('disconnect');
            // Remove the current keep-alive timer if it exists.
            this.clearKeepAliveTimer();
            // If this is a connection we're trying to tear down..
            if (this.status === ConnectionStatus.DISCONNECTING) {
                // If a reconnect timer is set, remove it.
                this.clearReconnectTimer();
                // Remove all event listeners
                this.removeAllListeners();
                // Mark the connection as disconnected.
                this.status = ConnectionStatus.DISCONNECTED;
                // Write a log message.
                debug.network(`Disconnected from '${this.hostIdentifier}'.`);
            }
            else {
                // If this is for an established connection..
                if (this.status === ConnectionStatus.CONNECTED) {
                    // Write a notification to the logs.
                    debug.errors(`Connection with '${this.hostIdentifier}' was closed, trying to reconnect in ${DefaultParameters.RECONNECT / 1000} seconds.`);
                }
                // Mark the connection as disconnected for now..
                this.status = ConnectionStatus.DISCONNECTED;
                // If we don't have a pending reconnection timer..
                if (!this.timers.reconnect) {
                    // Attempt to reconnect after one keep-alive duration.
                    this.timers.reconnect = setTimeout(this.reconnect.bind(this), DefaultParameters.RECONNECT);
                }
            }
        }
        /**
         * Notify administrator of any unexpected errors.
         */
        onSocketError(error) {
            // Report a generic error if no error information is present.
            // NOTE: When using WSS, the error event explicitly
            //       only allows to send a "simple" event without data.
            //       https://stackoverflow.com/a/18804298
            if (typeof error === 'undefined') {
                // Do nothing, and instead rely on the socket disconnect event for further information.
                return;
            }
            // If the DNS lookup failed.
            if (error.code === 'EAI_AGAIN') {
                debug.errors(`Failed to look up DNS records for '${this.host}'.`);
                return;
            }
            // If the connection timed out..
            if (error.code === 'ETIMEDOUT') {
                // Log the provided timeout message.
                debug.errors(error.message);
                return;
            }
            // Log unknown error
            debug.errors(`Unknown network error ('${this.hostIdentifier}'): `, error);
        }
    }

    const isRPCErrorResponse = function (message) {
        return 'id' in message && 'error' in message;
    };
    const isRPCNotification = function (message) {
        return !('id' in message) && 'method' in message;
    };

    /**
     * Triggers when the underlying connection is established.
     *
     * @event ElectrumClient#connected
     */
    /**
     * Triggers when the underlying connection is lost.
     *
     * @event ElectrumClient#disconnected
     */
    /**
     * High-level Electrum client that lets applications send requests and subscribe to notification events from a server.
     */
    class ElectrumClient extends events.EventEmitter {
        // Declare instance variables
        connection;
        // Initialize an empty list of subscription metadata.
        subscriptionMethods = {};
        subscriptionCallbacks = new WeakMap();
        // Start counting the request IDs from 0
        requestId = 0;
        // Initialize an empty dictionary for keeping track of request resolvers
        requestResolvers = {};
        /**
         * Initializes an Electrum client.
         *
         * @param {string} application       your application name, used to identify to the electrum host.
         * @param {string} version           protocol version to use with the host.
         * @param {string} host              fully qualified domain name or IP number of the host.
         * @param {number} port              the TCP network port of the host.
         * @param {TransportScheme} scheme   the transport scheme to use for connection
         * @param {number} timeout           how long network delays we will wait for before taking action, in milliseconds.
         * @param {number} pingInterval      the time between sending pings to the electrum host, in milliseconds.
         *
         * @throws {Error} if `version` is not a valid version string.
         */
        constructor(application, version, host, port = DefaultParameters.PORT, scheme = DefaultParameters.TRANSPORT_SCHEME, timeout = DefaultParameters.TIMEOUT, pingInterval = DefaultParameters.PING_INTERVAL) {
            // Initialize the event emitter.
            super();
            // Set up a connection to an electrum server.
            this.connection = new ElectrumConnection(application, version, host, port, scheme, timeout, pingInterval);
        }
        /**
         * Connects to the remote server.
         *
         * @throws {Error} if the socket connection fails.
         * @returns a promise resolving when the connection is established.
         */
        async connect() {
            // Listen for parsed statements.
            this.connection.on('statement', this.response.bind(this));
            // Hook up resubscription on connection.
            this.connection.on('connect', this.resubscribeOnConnect.bind(this));
            // Relay connect and disconnect events.
            this.connection.on('connect', this.emit.bind(this, 'connected'));
            this.connection.on('disconnect', this.onConnectionDisconnect.bind(this));
            // Relay error events.
            this.connection.on('error', this.emit.bind(this, 'error'));
            // Connect with the server.
            await this.connection.connect();
        }
        /**
         * Disconnects from the remote server and removes all event listeners/subscriptions and open requests.
         *
         * @param {boolean} force                 disconnect even if the connection has not been fully established yet.
         * @param {boolean} retainSubscriptions   retain subscription data so they will be restored on reconnection.
         *
         * @returns true if successfully disconnected, or false if there was no connection.
         */
        async disconnect(force = false, retainSubscriptions = false) {
            if (!retainSubscriptions) {
                // Cancel all event listeners.
                this.removeAllListeners();
                // Remove all subscription data
                this.subscriptionMethods = {};
            }
            // For each pending request..
            for (const index in this.requestResolvers) {
                // Reject the request.
                const requestResolver = this.requestResolvers[index];
                requestResolver(new Error('Manual disconnection'));
                // Remove the request.
                delete this.requestResolvers[index];
            }
            // Disconnect from the remove server.
            return this.connection.disconnect(force);
        }
        /**
         * Calls a method on the remote server with the supplied parameters.
         *
         * @param {string} method          name of the method to call.
         * @param {...string} parameters   one or more parameters for the method.
         *
         * @throws {Error} if the client is disconnected.
         * @returns a promise that resolves with the result of the method or an Error.
         */
        async request(method, ...parameters) {
            // If we are not connected to a server..
            if (this.connection.status !== ConnectionStatus.CONNECTED) {
                // Reject the request with a disconnected error message.
                throw (new Error(`Unable to send request to a disconnected server '${this.connection.host}'.`));
            }
            // Increase the request ID by one.
            this.requestId += 1;
            // Store a copy of the request id.
            const id = this.requestId;
            // Format the arguments as an electrum request object.
            const message = ElectrumProtocol.buildRequestObject(method, parameters, id);
            // Define a function to wrap the request in a promise.
            const requestResolver = (resolve) => {
                // Add a request resolver for this promise to the list of requests.
                this.requestResolvers[id] = (error, data) => {
                    // If the resolution failed..
                    if (error) {
                        // Resolve the promise with the error for the application to handle.
                        resolve(error);
                    }
                    else {
                        // Resolve the promise with the request results.
                        resolve(data);
                    }
                };
                // Send the request message to the remote server.
                this.connection.send(message);
            };
            // Write a log message.
            debug.network(`Sending request '${method}' to '${this.connection.host}'`);
            // return a promise to deliver results later.
            return new Promise(requestResolver);
        }
        /**
         * Subscribes to the method at the server and attaches the callback function to the event feed.
         *
         * @param {function}  callback     a function that should get notification messages.
         * @param {string}    method       one of the subscribable methods the server supports.
         * @param {...string} parameters   one or more parameters for the method.
         *
         * @throws {Error} if the client is disconnected.
         * @returns a promise resolving to true when the subscription is set up.
         */
        async subscribe(callback, method, ...parameters) {
            // Define a function resolve the subscription setup process.
            const subscriptionResolver = async (resolve) => {
                // If this method is not yet being listened on with this callback..
                if (!this.listeners(method).includes(callback)) {
                    // Set up event listener for this subscription.
                    this.addListener(method, callback);
                }
                // If this method has never been subscribed to before..
                if (!this.subscriptionMethods[method]) {
                    // Initialize an empty subscription payload list for this method.
                    this.subscriptionMethods[method] = [];
                }
                // Store the subscription parameters to track what data we have subscribed to.
                this.subscriptionMethods[method].push(JSON.stringify(parameters));
                // Get the currently subscribed payloads for this callback, or an empty array if none exist.
                const subscriptionCallbackPayloads = this.subscriptionCallbacks.get(callback) || [];
                // Update the subscription parameters to track what data this callback is listening on.
                subscriptionCallbackPayloads.push({ method, payload: JSON.stringify(parameters) });
                // Store the subscription parameters.
                this.subscriptionCallbacks.set(callback, subscriptionCallbackPayloads);
                // Send initial subscription request.
                const requestData = await this.request(method, ...parameters);
                // Manually send the initial request data to the callback.
                callback(requestData);
                // Resolve the subscription promise.
                resolve(true);
            };
            // Return a promise that resolves when the subscription is set up.
            return new Promise(subscriptionResolver);
        }
        /**
         * Unsubscribes to the method at the server and removes any callback functions
         * when there are no more subscriptions for the method.
         *
         * @param {function}  callback     a function that has previously been subscribed for this method.
         * @param {string}    method       a previously subscribed to method.
         * @param {...string} parameters   one or more parameters for the method.
         *
         * @throws {Error} if no subscriptions exist for the combination of the passed `callback`, `method` and `parameters.
         * @throws {Error} if the client is disconnected.
         * @returns a promise that resolves to true when the subscription has been cancelled.
         */
        async unsubscribe(callback, method, ...parameters) {
            // Throw an error if the client is disconnected.
            if (this.connection.status !== ConnectionStatus.CONNECTED) {
                throw (new Error(`Unable to send unsubscribe request to a disconnected server '${this.connection.host}'.`));
            }
            // Define a function resolve the subscription setup process.
            const subscriptionResolver = async (resolve) => {
                // Pack up the parameters as a long string.
                const subscriptionParameters = JSON.stringify(parameters);
                // If this method has no subscriptions..
                if (!this.subscriptionMethods[method]) {
                    // Reject this promise with an explanation.
                    throw (new Error(`Cannot unsubscribe from '${method}' since the method has no subscriptions.`));
                }
                // If this callback has no subscriptions..
                if (!this.subscriptionCallbacks.has(callback)) {
                    // Reject this promise with an explanation.
                    throw (new Error(`Cannot unsubscribe with '${callback.name}' since the callback has no subscriptions.`));
                }
                // Count the number of methods subscribed to this payload.
                const serverMethodPayloadCount = Object.values(this.subscriptionMethods[method])
                    .filter((payload) => payload === subscriptionParameters).length;
                // Count the number of callbacks attached to this method.
                const callbackMethodPayloadCount = (this.subscriptionCallbacks.get(callback) || [])
                    .filter((value) => value.method === method).length;
                // Locate the method and callback subscription index.
                const serverMethodPayloadIndex = this.subscriptionMethods[method].indexOf(subscriptionParameters);
                const callbackMethodPayloadIndex = (this.subscriptionCallbacks.get(callback) || [])
                    .findIndex((value) => (value.method === method && value.payload === subscriptionParameters));
                // If the method payload could not be located..
                if (serverMethodPayloadIndex < 0) {
                    // Reject this promise with an explanation.
                    throw (new Error(`Cannot unsubscribe from '${method}' since it has no subscription with the given parameters.`));
                }
                // If the callback payload could not be located..
                if (callbackMethodPayloadIndex < 0) {
                    // Reject this promise with an explanation.
                    throw (new Error(`Cannot unsubscribe with '${callback.name}' since it has no subscription with the given method and parameters.`));
                }
                // If this is the last payload that any callback has for this method..
                if (serverMethodPayloadCount === 1) {
                    // Remove this specific subscription payload from internal tracking.
                    this.subscriptionMethods[method].splice(serverMethodPayloadIndex, 1);
                    // If the subscription conforms to expected naming standards..
                    if (method.endsWith('.subscribe')) {
                        // Send unsubscription request to the server.
                        await this.request(method.replace('.subscribe', '.unsubscribe'), ...parameters);
                    }
                }
                // If this is the last payload that this specific callback has to this method..
                if (callbackMethodPayloadCount === 1) {
                    // Remove the current callback from listening to given method.
                    this.removeListener(method, callback);
                }
                // Get the currently subscribed payloads for this callback, or an empty array if none exist.
                const subscriptionCallbackPayloads = this.subscriptionCallbacks.get(callback) || [];
                // Remove the internal tracking of this callbacks specific method and payload combination.
                this.subscriptionCallbacks.set(callback, subscriptionCallbackPayloads.splice(callbackMethodPayloadIndex, 1));
                // Write a log message.
                debug.client(`Unsubscribed callback '${callback.name}' from '${String(method)}' for the '${subscriptionParameters}' parameters.`);
                // Resolve the subscription promise.
                resolve(true);
            };
            // Return a promise that resolves when the subscription is torn down.
            return new Promise(subscriptionResolver);
        }
        /**
         * Restores existing subscriptions without updating status or triggering manual callbacks.
         *
         * @throws {Error} if subscription data cannot be found for all stored event names.
         * @throws {Error} if the client is disconnected.
         * @returns a promise resolving to true when the subscriptions are restored.
         *
         * @ignore
         */
        async resubscribeOnConnect() {
            // Write a log message.
            debug.client(`Connected to '${this.connection.hostIdentifier}'.`);
            // For each method we have a listener for..
            for (const method of this.eventNames()) {
                // Ignore the connected, disconnected and error method/signals..
                if (method === 'connected' || method === 'disconnected' || method === 'error') {
                    continue;
                }
                // Check that we really have a subscription to restore.
                if (!this.subscriptionMethods[String(method)]) {
                    // Throw an error since this breaks our expectations.
                    throw (new Error(`Unable to resubscribe to ${String(method)} at ${this.connection.hostIdentifier} due to missing subscription data.`));
                }
                // .. and for each parameter we have previously been subscribed to..
                for (const parameterJSON of this.subscriptionMethods[String(method)]) {
                    // restore the parameters from JSON.
                    const parameters = JSON.parse(parameterJSON);
                    // Send a subscription request.
                    await this.request(String(method), ...parameters);
                }
                // Write a log message.
                debug.client(`Restored ${this.subscriptionMethods[String(method)].length} previous '${String(method)}' subscriptions for '${this.connection.hostIdentifier}'`);
            }
            // Resolve the subscription promise.
            return true;
        }
        /**
         * Parser messages from the remote server to resolve request promises and emit subscription events.
         *
         * @param {RPCNotification | RPCResponse} message   the response message
         *
         * @throws {Error} if the message ID does not match an existing request.
         * @ignore
         */
        response(message) {
            // If the received message is a notification, we forward it to all event listeners
            if (isRPCNotification(message)) {
                // Write a log message.
                debug.client(`Received notification for '${message.method}' from '${this.connection.host}'`);
                // Forward the message content to all event listeners.
                this.emit(message.method, message.params);
                // Return since it does not have an associated request resolver
                return;
            }
            // If the response ID is null we cannot use it to index our request resolvers
            if (message.id === null) {
                // Throw an internal error, this should not happen.
                throw (new Error('Internal error: Received an RPC response with ID null.'));
            }
            // Look up which request promise we should resolve this.
            const requestResolver = this.requestResolvers[message.id];
            // If we do not have a request resolver for this response message..
            if (!requestResolver) {
                // Throw an internal error, this should not happen.
                throw (new Error('Internal error: Callback for response not available.'));
            }
            // Remove the promise from the request list.
            delete this.requestResolvers[message.id];
            // If the message contains an error..
            if (isRPCErrorResponse(message)) {
                // Forward the message error to the request resolver and omit the `result` parameter.
                requestResolver(new Error(message.error.message));
            }
            else {
                // Forward the message content to the request resolver and omit the `error` parameter
                // (by setting it to undefined).
                requestResolver(undefined, message.result);
            }
        }
        /**
         * Callback function that is called when connection to the Electrum server is lost.
         * Aborts all active requests with an error message indicating that connection was lost.
         *
         * @ignore
         */
        onConnectionDisconnect() {
            // Emit a disconnection signal to any listeners.
            this.emit('disconnected');
            // Loop over active requests
            for (const resolverId in this.requestResolvers) {
                // Extract request resolver for readability
                const requestResolver = this.requestResolvers[resolverId];
                // Resolve the active request with an error indicating that the connection was lost.
                requestResolver(new Error('Connection lost'));
                // Remove the promise from the request list.
                delete this.requestResolvers[resolverId];
            }
        }
    }

    /**
     * Triggers when the cluster connects to enough servers to satisfy both the cluster confidence and distribution policies.
     *
     * @event ElectrumCluster#ready
     */
    /**
     * Triggers when the cluster loses a connection and can no longer satisfy the cluster distribution policy.
     *
     * @event ElectrumCluster#degraded
     */
    /**
     * Triggers when the cluster loses a connection and can no longer satisfy the cluster confidence policy.
     *
     * @event ElectrumCluster#disabled
     */
    /**
     * High-level electrum client that provides transparent load balancing, confidence checking and/or low-latency polling.
     */
    class ElectrumCluster extends events.EventEmitter {
        application;
        version;
        timeout;
        pingInterval;
        // Declare instance variables
        strategy;
        // Initialize an empty dictionary of clients in the cluster
        clients = {};
        // Start at 0 connected clients
        connections = 0;
        // Set up an empty set of notification data.
        notifications = {};
        // Start the cluster in DISABLED state
        status = ClusterStatus.DISABLED;
        // Start counting request IDs at 0
        requestCounter = 0;
        // Initialize an empty dictionary for keeping track of request resolvers
        requestPromises = {};
        // Lock to prevent concurrency race conditions when sending requests.
        requestLock = new Mutex();
        // Lock to prevent concurrency race conditions when receiving responses.
        responseLock = new Mutex();
        /**
         * @param {string} application    your application name, used to identify to the electrum hosts.
         * @param {string} version        protocol version to use with the hosts.
         * @param {number} confidence     wait for this number of hosts to provide identical results.
         * @param {number} distribution   request information from this number of hosts.
         * @param {ClusterOrder} order    select hosts to communicate with in this order.
         * @param {number} timeout        how long network delays we will wait for before taking action, in milliseconds.
         * @param {number} pingInterval      the time between sending pings to the electrum host, in milliseconds.
         */
        constructor(application, version, confidence = DefaultParameters.CLUSTER_CONFIDENCE, distribution = DefaultParameters.CLUSTER_DISTRIBUTION, order = DefaultParameters.CLUSTER_ORDER, timeout = DefaultParameters.TIMEOUT, pingInterval = DefaultParameters.PING_INTERVAL) {
            // Initialize the event emitter.
            super();
            this.application = application;
            this.version = version;
            this.timeout = timeout;
            this.pingInterval = pingInterval;
            // Initialize strategy.
            this.strategy =
                {
                    distribution: distribution,
                    confidence: confidence,
                    order: order,
                };
            // Write a log message.
            debug.cluster(`Initialized empty cluster (${confidence} of ${distribution || 'ALL'})`);
            // Print out a warning if we cannot guarantee consensus for subscription notifications.
            // Case 1: we don't know how many servers will be used, so warning just to be safe
            // Case 2: we know the number of servers needed to trust a response is less than 50%.
            if ((distribution === ClusterDistribution.ALL) || (confidence / distribution <= 0.50)) {
                debug.warning(`Subscriptions might return multiple valid responses when confidence (${confidence}) is less than 51% of distribution.`);
            }
        }
        /**
         * Adds a server to the cluster.
         *
         * @param {string} host              fully qualified domain name or IP number of the host.
         * @param {number} port              the TCP network port of the host.
         * @param {TransportScheme} scheme   the transport scheme to use for connection
         * @param {boolean} autoConnect      flag indicating whether the server should automatically connect (default true)
         *
         * @throws {Error} if the cluster's version is not a valid version string.
         * @returns a promise that resolves when the connection has been initiated.
         */
        async addServer(host, port = DefaultParameters.PORT, scheme = DefaultParameters.TRANSPORT_SCHEME, autoConnect = true) {
            // Set up a new electrum client.
            const client = new ElectrumClient(this.application, this.version, host, port, scheme, this.timeout, this.pingInterval);
            // Store this client.
            this.clients[`${host}:${port}`] =
                {
                    state: ClientState.UNAVAILABLE,
                    connection: client,
                };
            /**
             * Define a helper function to evaluate and log cluster status.
             *
             * @fires ElectrumCluster#ready
             * @fires ElectrumCluster#degraded
             * @fires ElectrumCluster#disabled
             */
            const updateClusterStatus = () => {
                // Calculate the required distribution, taking into account that distribution to all is represented with 0.
                const distribution = Math.max(this.strategy.confidence, this.strategy.distribution);
                // Check if we have enough connections to saturate distribution.
                if (this.connections >= distribution) {
                    // If the cluster is not currently considered ready..
                    if (this.status !== ClusterStatus.READY) {
                        // Mark the cluster as ready.
                        this.status = ClusterStatus.READY;
                        // Emit the ready signal to indicate the cluster is running in a ready mode.
                        this.emit('ready');
                        // Write a log message with an update on the current cluster status.
                        debug.cluster(`Cluster status is ready (currently ${this.connections} of ${distribution} connections available.)`);
                    }
                }
                // If we still have enough available connections to reach confidence..
                else if (this.connections >= this.strategy.confidence) {
                    // If the cluster is not currently considered degraded..
                    if (this.status !== ClusterStatus.DEGRADED) {
                        // Mark the cluster as degraded.
                        this.status = ClusterStatus.DEGRADED;
                        // Emit the degraded signal to indicate the cluster is running in a degraded mode.
                        this.emit('degraded');
                        // Write a log message with an update on the current cluster status.
                        debug.cluster(`Cluster status is degraded (only ${this.connections} of ${distribution} connections available.)`);
                    }
                }
                // If we don't have enough connections to reach confidence..
                // .. and the cluster is not currently considered disabled..
                else if (this.status !== ClusterStatus.DISABLED) {
                    // Mark the cluster as disabled.
                    this.status = ClusterStatus.DISABLED;
                    // Emit the degraded signal to indicate the cluster is disabled.
                    this.emit('disabled');
                    // Write a log message with an update on the current cluster status.
                    debug.cluster(`Cluster status is disabled (only ${this.connections} of the ${distribution} connections are available.)`);
                }
            };
            // Define a function to run when client has connects.
            const onConnect = async () => {
                // Wrap in a try-catch so we can ignore errors.
                try {
                    // Check connection status
                    const connectionStatus = client.connection.status;
                    // If the connection is fine..
                    if (connectionStatus === ConnectionStatus.CONNECTED) {
                        // If this was from an unavailable connection..
                        if (this.clients[`${host}:${port}`].state === ClientState.UNAVAILABLE) {
                            // Update connection counter.
                            this.connections += 1;
                        }
                        // Set client state to available.
                        this.clients[`${host}:${port}`].state = ClientState.AVAILABLE;
                        // update the cluster status.
                        updateClusterStatus();
                    }
                }
                catch (error) {
                    // Do nothing.
                }
            };
            // Define a function to run when client disconnects.
            const onDisconnect = () => {
                // If this was from an established connection..
                if (this.clients[`${host}:${port}`].state === ClientState.AVAILABLE) {
                    // Update connection counter.
                    this.connections -= 1;
                }
                // Set client state to unavailable.
                this.clients[`${host}:${port}`].state = ClientState.UNAVAILABLE;
                // update the cluster status.
                updateClusterStatus();
            };
            // Set up handlers for connection and disconnection.
            client.connection.on('connect', onConnect.bind(this));
            client.connection.on('disconnect', onDisconnect.bind(this));
            // Connect if auto-connect is set to true, returning the connection result.
            if (autoConnect) {
                // Set up the connection.
                await client.connect();
            }
        }
        /**
         * Calls a method on the remote server with the supplied parameters.
         *
         * @param {string}    method       name of the method to call.
         * @param {...string} parameters   one or more parameters for the method.
         *
         * @throws {Error} if not enough clients are connected
         * @throws {Error} if no response is received with sufficient integrity
         * @returns a promise that resolves with the result of the method.
         */
        async request(method, ...parameters) {
            // Check if the cluster is unable to serve requests.
            if (this.status === ClusterStatus.DISABLED) {
                throw (new Error(`Cannot request '${method}' when available clients (${this.connections}) is less than required confidence (${this.strategy.confidence}).`));
            }
            // Lock this request method temporarily.
            const unlock = await this.requestLock.acquire();
            // Declare requestId outside of try-catch scope.
            let requestId = 0;
            // NOTE: If this async method is called very rapidly, it's theoretically possible that the parts below could interfere.
            try {
                // Increase the current request counter.
                this.requestCounter += 1;
                // Copy the request counter so we can work with the copy and know it won't change
                // even if the request counter is raised from concurrent requests.
                requestId = this.requestCounter;
            }
            finally {
                // Unlock this request method now that the concurrency sensitive condition is completed.
                unlock();
            }
            // Initialize an empty list of request promises.
            this.requestPromises[requestId] = [];
            // Extract all available client IDs
            const availableClientIDs = Object.keys(this.clients)
                .filter((clientID) => this.clients[clientID].state === ClientState.AVAILABLE);
            // Initialize a sent counter.
            let sentCounter = 0;
            // Determine the number of clients we need to send to, taking ClusterDistribution.ALL (=0) into account.
            let requiredDistribution = (this.strategy.distribution || availableClientIDs.length);
            // If the cluster is in degraded status, we do not have enough available clients to
            // match distribution, but still enough to reach consensus, so we use the clients we have.
            if (this.status === ClusterStatus.DEGRADED) {
                requiredDistribution = availableClientIDs.length;
            }
            // Repeat until we have sent the request to the desired number of clients.
            while (sentCounter < requiredDistribution) {
                // Pick an array index according to our ordering strategy.
                let currentIndex = 0;
                // Use a random array index when cluster order is set to RANDOM
                if (this.strategy.order === ClusterOrder.RANDOM) {
                    currentIndex = Math.floor(Math.random() * availableClientIDs.length);
                }
                // Move a client identity from the client list to its own variable.
                const [currentClient] = availableClientIDs.splice(currentIndex, 1);
                // Send the request to the client and store the request promise.
                const requestPromise = this.clients[currentClient].connection.request(method, ...parameters);
                this.requestPromises[requestId].push(requestPromise);
                // Increase the sent counter.
                sentCounter += 1;
            }
            // Define a function to poll for request responses.
            const pollResponse = (resolve, reject) => {
                // Define a function to resolve request responses based on integrity.
                const resolveRequest = async () => {
                    // Set up an empty set of response data.
                    const responseData = {};
                    // Set up a counter to keep track of how many responses we have checked.
                    let checkedResponses = 0;
                    // For each server we issued a request to..
                    for (const currentPromise in this.requestPromises[requestId]) {
                        // Race the request promise against a pre-resolved request to determine promise status.
                        const promises = [this.requestPromises[requestId][currentPromise], Promise.resolve(undefined)];
                        const response = await Promise.race(promises);
                        // If the promise is settled..
                        if (response !== undefined) {
                            // Calculate a unique identifier for this notification data.
                            const responseDataIdentifier = JSON.stringify(response);
                            // Increase the counter for checked responses.
                            checkedResponses += 1;
                            // Either set the response data counter or increase it.
                            if (responseData[responseDataIdentifier] === undefined) {
                                responseData[responseDataIdentifier] = 1;
                            }
                            else {
                                responseData[responseDataIdentifier] += 1;
                            }
                            // Check if this response has enough integrity according to our confidence strategy.
                            if (responseData[responseDataIdentifier] === this.strategy.confidence) {
                                // Write log entry.
                                debug.cluster(`Validated response for '${method}' with sufficient integrity (${this.strategy.confidence}).`);
                                // Resolve the request with this response.
                                resolve(response);
                                // Return after resolving since we do not want to continue the execution.
                                return;
                            }
                        }
                    }
                    // If all clients have responded but we failed to reach desired integrity..
                    if (checkedResponses === this.requestPromises[requestId].length) {
                        // Reject this request with an error message.
                        reject(new Error(`Unable to complete request for '${method}', response failed to reach sufficient integrity (${this.strategy.confidence}).`));
                        // Return after rejecting since we do not want to continue the execution.
                        return;
                    }
                    // If we are not ready, but have not timed out and should wait more..
                    setTimeout(resolveRequest, 1000);
                };
                // Attempt the initial resolution of the request.
                resolveRequest();
            };
            // return some kind of promise that resolves when integrity number of clients results match.
            return new Promise(pollResponse);
        }
        /**
         * Subscribes to the method at the cluster and attaches the callback function to the event feed.
         *
         * @param {function}  callback     a function that should get notification messages.
         * @param {string}    method       one of the subscribable methods the server supports.
         * @param {...string} parameters   one or more parameters for the method.
         *
         * @throws {Error} if not enough clients are connected
         * @throws {Error} if no response is received with sufficient integrity for the initial request
         * @returns a promise resolving to true when the subscription is set up.
         */
        async subscribe(callback, method, ...parameters) {
            // Define a function resolve the subscription setup process.
            const subscriptionResolver = async (resolve) => {
                // Define a callback function to validate server notifications and pass
                // them to the subscribe callback.
                const subscriptionResponder = async (data) => {
                    // Lock this response method temporarily.
                    const unlock = await this.responseLock.acquire();
                    try {
                        // Calculate a unique identifier for this notification data.
                        const responseDataIdentifier = JSON.stringify(data);
                        // Either set the notification counter or increase it.
                        if (this.notifications[responseDataIdentifier] === undefined) {
                            this.notifications[responseDataIdentifier] = 1;
                        }
                        else {
                            this.notifications[responseDataIdentifier] += 1;
                        }
                        // Check if this notification has enough integrity according to our confidence strategy.
                        if (this.notifications[responseDataIdentifier] === this.strategy.confidence) {
                            // Write log entry.
                            debug.cluster(`Validated notification for '${method}' with sufficient integrity (${this.strategy.confidence}).`);
                            // Send the notification data to the callback function.
                            callback(data);
                        }
                    }
                    finally {
                        // Unlock the response method so it can handle the next set of data.
                        unlock();
                    }
                };
                // Set up event listener for this subscription.
                for (const currentClient in this.clients) {
                    // Copy the current client for brevity.
                    const client = this.clients[currentClient].connection;
                    // If this method is not yet being listened on..
                    if (!client.listeners(method).includes(subscriptionResponder)) {
                        // Set up event listener for this subscription.
                        client.addListener(method, subscriptionResponder);
                    }
                    // If this method has never been subscribed to before..
                    if (!client.subscriptionMethods[method]) {
                        // Initialize an empty subscription payload list for this method.
                        client.subscriptionMethods[method] = [];
                    }
                    // Store the subscription parameters to track what data we have subscribed to.
                    client.subscriptionMethods[method].push(JSON.stringify(parameters));
                    // Get the currently subscribed payloads for this callback, or an empty array if none exist.
                    const subscriptionCallbackPayloads = client.subscriptionCallbacks.get(callback) || [];
                    // Update the subscription parameters to track what data this callback is listening on.
                    subscriptionCallbackPayloads.push({ method, payload: JSON.stringify(parameters) });
                    // Store the subscription parameters.
                    client.subscriptionCallbacks.set(callback, subscriptionCallbackPayloads);
                }
                // Send initial subscription request.
                const requestData = await this.request(method, ...parameters);
                // Manually send the initial request data to the callback.
                callback(requestData);
                // Resolve the subscription promise.
                resolve(true);
            };
            // Return a promise that resolves when the subscription is set up.
            return new Promise(subscriptionResolver);
        }
        /**
         * Unsubscribes to the method at the cluster and removes any callback functions
         * when there are no more subscriptions for the method.
         *
         * @param {function}  callback     a function that has previously been subscribed for this method.
         * @param {string}    method       one of the subscribable methods the server supports.
         * @param {...string} parameters   one or more parameters for the method.
         *
         * @throws {Error} if, for any of the clients, no subscriptions exist for the combination of the
         * passed `callback`, `method` and `parameters.
         * @returns a promise resolving to true when the subscription has been cancelled.
         */
        async unsubscribe(callback, method, ...parameters) {
            // Define a function resolve the subscription setup process.
            const subscriptionResolver = async (resolve) => {
                // For each client..
                for (const currentClient in this.clients) {
                    // Store client in variable for brevity
                    const client = this.clients[currentClient].connection;
                    // Log a warning if one of the clients is disconnected, but don't throw an error
                    if (client.connection.status !== ConnectionStatus.CONNECTED) {
                        debug.warning(`Client with server ${client.connection.host} could not be reached to unsubscribe`);
                        continue;
                    }
                    // unsubscribe this client.
                    client.unsubscribe(callback, method, ...parameters);
                }
                // Resolve the subscription promise.
                resolve(true);
            };
            // Return a promise that resolves when the subscription is set up.
            return new Promise(subscriptionResolver);
        }
        /**
         * Provides a method to check or wait for the cluster to become ready.
         *
         * @returns a promise that resolves when the required servers are available.
         */
        async ready() {
            // Store the current timestamp.
            const readyTimestamp = Date.now();
            // Define a function to poll for availability of the cluster.
            const availabilityPoller = (resolve) => {
                // Define a function to check if the cluster is ready to be used.
                const connectionAvailabilityVerifier = () => {
                    // Check if the cluster is active..
                    if (this.status === ClusterStatus.READY) {
                        // Resolve with true to indicate that the cluster is ready to use.
                        resolve(true);
                        // Return after resolving since we do not want to continue the execution.
                        return;
                    }
                    // Calculate how long we have waited, in milliseconds.
                    const timeWaited = (Date.now() - readyTimestamp);
                    // Check if we have waited longer than our timeout setting.
                    if (timeWaited > this.timeout) {
                        // Resolve with false to indicate that we did not get ready in time.
                        resolve(false);
                        // Return after resolving since we do not want to continue the execution.
                        return;
                    }
                    // If we are not ready, but have not timed out and should wait more..
                    setTimeout(connectionAvailabilityVerifier, 50);
                };
                // Run the initial verification.
                connectionAvailabilityVerifier();
            };
            // Return a promise that resolves when the available clients is sufficient.
            return new Promise(availabilityPoller);
        }
        /**
         * Connects all servers from the cluster and attaches event listeners and handlers
         * for all underlying clients and connections.
         *
         * @throws {Error} if the cluster's version is not a valid version string.
         */
        async startup() {
            // Write a log message.
            debug.cluster('Starting up cluster.');
            // Keep track of all connections
            const connections = [];
            // Loop over all clients and reconnect them if they're disconnected
            for (const clientKey in this.clients) {
                // Retrieve connection information for the client
                const { host, port, scheme } = this.clients[clientKey].connection.connection;
                // Only connect currently unavailable/disconnected clients
                if (this.clients[clientKey].state === ClientState.AVAILABLE) {
                    // Warn when a server is already connected when calling startup()
                    debug.warning(`Called startup(), but server ${host}:${port} is already connected`);
                }
                else {
                    // Call the addServer() function with the existing connection data
                    // This effectively reconnects the server and re-instates all event listeners
                    connections.push(this.addServer(host, port, scheme));
                }
            }
            // Await all connections
            return Promise.all(connections);
        }
        /**
         * Disconnects all servers from the cluster. Removes all event listeners and
         * handlers from all underlying clients and connections. This includes all
         * active subscriptions, unless retainSubscriptions is set to true.
         *
         * @param {boolean} retainSubscriptions   retain subscription data so they will be restored on reconnection.
         *
         * @returns a list with the disconnection result for every client
         */
        async shutdown(retainSubscriptions = false) {
            // Write a log message.
            debug.cluster('Shutting down cluster.');
            // Set up a list of disconnections to wait for.
            const disconnections = [];
            const disconnectResolver = (resolve) => {
                // Resolve once the cluster is marked as disabled
                this.once('disabled', () => resolve(Promise.all(disconnections)));
                // For each client in this cluster..
                for (const clientIndex in this.clients) {
                    // Force disconnection regardless of current status.
                    disconnections.push(this.clients[clientIndex].connection.disconnect(true, retainSubscriptions));
                }
            };
            // Return a list of booleans indicating disconnections from all clients
            return new Promise(disconnectResolver);
        }
    }

    var __awaiter$1 = (window && window.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class ElectrumNetworkProvider {
        constructor(network = Network.MAINNET, electrum, manualConnectionManagement) {
            this.network = network;
            this.manualConnectionManagement = manualConnectionManagement;
            this.concurrentRequests = 0;
            // If a custom Electrum Cluster is passed, we use it instead of the default.
            if (electrum) {
                this.electrum = electrum;
                return;
            }
            if (network === Network.MAINNET) {
                // Initialise a 2-of-3 Electrum Cluster with 6 reliable hardcoded servers
                // using the first three servers as "priority" servers
                this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 2, 3, ClusterOrder.PRIORITY);
                this.electrum.addServer('bch.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
                this.electrum.addServer('blackie.c3-soft.com', 50004, ElectrumTransport.WSS.Scheme, false);
                this.electrum.addServer('electroncash.de', 60002, ElectrumTransport.WSS.Scheme, false);
                this.electrum.addServer('electroncash.dk', 50004, ElectrumTransport.WSS.Scheme, false);
                this.electrum.addServer('bch.loping.net', 50004, ElectrumTransport.WSS.Scheme, false);
                this.electrum.addServer('electrum.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
            }
            else if (network === Network.TESTNET) {
                // Initialise a 1-of-2 Electrum Cluster with 2 hardcoded servers
                this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 1, 2, ClusterOrder.PRIORITY);
                this.electrum.addServer('blackie.c3-soft.com', 60004, ElectrumTransport.WSS.Scheme, false);
                this.electrum.addServer('electroncash.de', 60004, ElectrumTransport.WSS.Scheme, false);
                // this.electrum.addServer('bch.loping.net', 60004, ElectrumTransport.WSS.Scheme, false);
                // this.electrum.addServer('testnet.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme);
            }
            else if (network === Network.STAGING) {
                this.electrum = new ElectrumCluster('CashScript Application', '1.4.1', 1, 1, ClusterOrder.PRIORITY);
                this.electrum.addServer('testnet4.imaginary.cash', 50004, ElectrumTransport.WSS.Scheme, false);
            }
            else {
                throw new Error(`Tried to instantiate an ElectrumNetworkProvider for unsupported network ${network}`);
            }
        }
        getUtxos(address) {
            return __awaiter$1(this, void 0, void 0, function* () {
                const scripthash = addressToElectrumScriptHash(address);
                const result = yield this.performRequest('blockchain.scripthash.listunspent', scripthash);
                const utxos = result.map((utxo) => ({
                    txid: utxo.tx_hash,
                    vout: utxo.tx_pos,
                    satoshis: utxo.value,
                    height: utxo.height,
                }));
                return utxos;
            });
        }
        getBlockHeight() {
            return __awaiter$1(this, void 0, void 0, function* () {
                const { height } = yield this.performRequest('blockchain.headers.subscribe');
                return height;
            });
        }
        getRawTransaction(txid) {
            return __awaiter$1(this, void 0, void 0, function* () {
                return yield this.performRequest('blockchain.transaction.get', txid);
            });
        }
        sendRawTransaction(txHex) {
            return __awaiter$1(this, void 0, void 0, function* () {
                return yield this.performRequest('blockchain.transaction.broadcast', txHex);
            });
        }
        connectCluster() {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    return yield this.electrum.startup();
                }
                catch (e) {
                    return [];
                }
            });
        }
        disconnectCluster() {
            return __awaiter$1(this, void 0, void 0, function* () {
                return this.electrum.shutdown();
            });
        }
        performRequest(name, ...parameters) {
            return __awaiter$1(this, void 0, void 0, function* () {
                // Only connect the cluster when no concurrent requests are running
                if (this.shouldConnect()) {
                    this.connectCluster();
                }
                this.concurrentRequests += 1;
                yield this.electrum.ready();
                let result;
                try {
                    result = yield this.electrum.request(name, ...parameters);
                }
                finally {
                    // Always disconnect the cluster, also if the request fails
                    // as long as no other concurrent requests are running
                    if (this.shouldDisconnect()) {
                        yield this.disconnectCluster();
                    }
                }
                this.concurrentRequests -= 1;
                if (result instanceof Error)
                    throw result;
                return result;
            });
        }
        shouldConnect() {
            if (this.manualConnectionManagement)
                return false;
            if (this.concurrentRequests !== 0)
                return false;
            return true;
        }
        shouldDisconnect() {
            if (this.manualConnectionManagement)
                return false;
            if (this.concurrentRequests !== 1)
                return false;
            return true;
        }
    }
    /**
     * Helper function to convert an address to an electrum-cash compatible scripthash.
     * This is necessary to support electrum versions lower than 1.4.3, which do not
     * support addresses, only script hashes.
     *
     * @param address Address to convert to an electrum scripthash
     *
     * @returns The corresponding script hash in an electrum-cash compatible format
     */
    function addressToElectrumScriptHash(address) {
        // Retrieve locking script
        const lockScript = addressToLockScript(address);
        // Hash locking script
        const scriptHash = sha256$1(lockScript);
        // Reverse scripthash
        scriptHash.reverse();
        // Return scripthash as a hex string
        return binToHex(scriptHash);
    }

    var __awaiter = (window && window.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class Contract$1 {
        constructor(artifact, constructorArgs, provider = new ElectrumNetworkProvider()) {
            this.artifact = artifact;
            this.provider = provider;
            const expectedProperties = ['abi', 'bytecode', 'constructorInputs', 'contractName'];
            if (!expectedProperties.every((property) => property in artifact)) {
                throw new Error('Invalid or incomplete artifact provided');
            }
            if (artifact.constructorInputs.length !== constructorArgs.length) {
                throw new Error(`Incorrect number of arguments passed to ${artifact.contractName} constructor`);
            }
            // Encode arguments (this also performs type checking)
            const encodedArgs = constructorArgs
                .map((arg, i) => encodeArgument(arg, artifact.constructorInputs[i].type))
                .reverse();
            // Check there's no signature templates in the constructor
            if (encodedArgs.some((arg) => arg instanceof SignatureTemplate)) {
                throw new Error('Cannot use signatures in constructor');
            }
            this.redeemScript = generateRedeemScript(asmToScript(this.artifact.bytecode), encodedArgs);
            // Populate the functions object with the contract's functions
            // (with a special case for single function, which has no "function selector")
            this.functions = {};
            if (artifact.abi.length === 1) {
                const f = artifact.abi[0];
                this.functions[f.name] = this.createFunction(f);
            }
            else {
                artifact.abi.forEach((f, i) => {
                    this.functions[f.name] = this.createFunction(f, i);
                });
            }
            this.name = artifact.contractName;
            this.address = scriptToAddress(this.redeemScript, this.provider.network);
            this.bytesize = calculateBytesize(this.redeemScript);
            this.opcount = countOpcodes(this.redeemScript);
        }
        getBalance() {
            return __awaiter(this, void 0, void 0, function* () {
                const utxos = yield this.getUtxos();
                return utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);
            });
        }
        getUtxos() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.provider.getUtxos(this.address);
            });
        }
        getRedeemScriptHex() {
            return binToHex(scriptToBytecode(this.redeemScript));
        }
        createFunction(abiFunction, selector) {
            return (...args) => {
                if (abiFunction.inputs.length !== args.length) {
                    throw new Error(`Incorrect number of arguments passed to function ${abiFunction.name}`);
                }
                // Encode passed args (this also performs type checking)
                const encodedArgs = args
                    .map((arg, i) => encodeArgument(arg, abiFunction.inputs[i].type));
                return new Transaction(this.address, this.provider, this.redeemScript, abiFunction, encodedArgs, selector);
            };
        }
    }

    function deriveLockingBytecodeHex(address) {
        let bytecode = deriveLockingBytecode(address);
        return binToHex(bytecode);
    }
    function deriveLockingBytecode(address) {
        let lock = cashAddressToLockingBytecode(address);
        if (typeof (lock) === "string")
            throw lock;
        return lock.bytecode;
    }
    function getPrefixFromNetwork(network) {
        let prefix = !network ? CashAddressNetworkPrefix.mainnet : undefined;
        if (!prefix) {
            if (network == "mainnet")
                prefix = CashAddressNetworkPrefix.mainnet;
            if (network == "staging")
                prefix = CashAddressNetworkPrefix.testnet;
            if (network == "regtest")
                prefix = CashAddressNetworkPrefix.regtest;
        }
        if (!prefix)
            throw Error("unknown network");
        return prefix;
    }
    function createOpReturnData(opReturnData) {
        const script = [
            Op.OP_RETURN,
            ...opReturnData.map((output) => toBin(output)),
        ];
        return encodeNullDataScript$1(script);
    }
    function toBin(output) {
        const data = output.replace(/^0x/, '');
        const encode = data === output ? utf8ToBin : hexToBin;
        return encode(data);
    }
    function toHex(num) {
        let hex = binToHex(numberToBinUintLE(num)).toUpperCase();
        if (!hex)
            hex = "00";
        return "0x" + hex;
    }
    function binToNumber(data) {
        let h = binToNumberUintLE(data);
        return h;
    }
    // For decoding OP_RETURN data 
    function decodeNullDataScript(data) {
        if (data.slice(0, 1)[0] !== 106) {
            throw Error("Attempted to decode NullDataScript without a OP_RETURN code (106), not an OpReturn output?");
        }
        // skip the OP_RETURN code data[0]
        let i = 1;
        let r = [];
        while (i < data.length) {
            if (data.slice(i, i + 1)[0] === 0x4c) {
                r.push(data.slice(i, i + 1));
            }
            else if (data.slice(i, i + 1)[0] === 0x4d) {
                throw Error("Not Implemented");
            }
            else {
                let len = data.slice(i, i + 1)[0];
                let start = i + 1;
                let end = start + len;
                r.push(data.slice(start, end));
                i = end;
            }
        }
        return r;
    }
    /**
     * hash160 - Calculate the sha256, ripemd160 hash of a value
     *
     * @param {message} Uint8Array       value to hash as a binary array
     *
     * @returns a promise to the hash160 value of the input
     */
    async function hash160(message) {
        const ripemd160 = await instantiateRipemd160();
        const sha256 = await instantiateSha256();
        return ripemd160.hash(sha256.hash(message));
    }
    /**
     * sha256 - Calculate the sha256 a value
     *
     * @param {message} Uint8Array       value to hash as a binary array
     *
     * @returns a promise to the sha256 value of the input
     */
    async function sha256(message) {
        const sha256 = await instantiateSha256();
        return sha256.hash(message);
    }
    // Simple function to get a random integer
    function getRandomIntWeak(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    function sum(previousValue, currentValue) {
        return previousValue + currentValue;
    }

    class BaseUtxPhiContract {
        constructor(network, script, params) {
            // Seems to have an issue with cluster never responding.
            // if(network==="mainnet") {
            //     let cluster = new ElectrumCluster('UtxPhi', '1.4.1', 1, 1, ClusterOrder.RANDOM);
            //     cluster.addServer('bch.imaginary.cash', 50004, ElectrumTransport.WS.Scheme, false);
            //     cluster.addServer('electrum.imaginary.cash', 50004, ElectrumTransport.WS.Scheme, false);
            //     this.provider = new ElectrumNetworkProvider('mainnet',cluster);
            //     this.testnet = false
            // }
            // else if(network==="staging"){
            //     let cluster = new ElectrumCluster('UtxPhi - staging', '1.4.1', 1, 1, ClusterOrder.RANDOM);
            //     cluster.addServer('testnet4.imaginary.cash', 50004, ElectrumTransport.WS.Scheme, false);
            //     this.provider = new ElectrumNetworkProvider('staging',cluster) 
            //     this.testnet = true
            // }
            if (network === "mainnet") {
                this.provider = new ElectrumNetworkProvider('mainnet');
                this.testnet = false;
            }
            else if (network === "staging") {
                this.provider = new ElectrumNetworkProvider('staging');
                this.testnet = true;
            }
            else if (network === "regtest") {
                let cluster = new ElectrumCluster('UtxPhi - regtest', '1.4.1', 1, 1, ClusterOrder.RANDOM);
                cluster.addServer('127.0.0.1', 60003, ElectrumTransport.WS.Scheme, false);
                this.provider = new ElectrumNetworkProvider("regtest", cluster);
                this.testnet = true;
            }
            else
                throw ("unrecognized network");
            this.contract = new Contract$1(script, [...params], this.provider);
        }
        async getBalance() {
            let bal = await this.contract.getBalance();
            return bal;
        }
        getAddress() {
            return this.contract.address;
        }
        getLockingBytecode(hex = true) {
            if (hex)
                return deriveLockingBytecodeHex(this.contract.address);
            return deriveLockingBytecode(this.contract.address);
        }
        asText() {
            throw Error("Cannot get contract text description from base class");
        }
        getRedeemScriptHex() {
            return this.contract.getRedeemScriptHex();
        }
        getFunction(fn) {
            return this.contract.functions[fn];
        }
        isTestnet() {
            return this.testnet;
        }
        async isFunded() {
            return (await this.getBalance()) > 0;
        }
        async info(cat = true) {
            let bal = await this.getBalance();
            let info = `# ${this.asText()}\n` +
                `# ${this.toString()}\n` +
                `address:         ${this.getAddress()}\n`
                +
                    `balance:        ${bal}\n`;
            if (cat) {
                console.log(info);
                return;
            }
            else {
                return info;
            }
        }
    }

    // Automatically Generated
    const artifact$7 = {
        "contractName": "Annuity",
        "constructorInputs": [
            {
                "name": "period",
                "type": "int"
            },
            {
                "name": "recipientLockingBytecode",
                "type": "bytes"
            },
            {
                "name": "installment",
                "type": "int"
            },
            {
                "name": "executorAllowance",
                "type": "int"
            }
        ],
        "abi": [
            {
                "name": "execute",
                "inputs": []
            }
        ],
        "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_CHECKSEQUENCEVERIFY OP_DROP OP_1 OP_OUTPUTBYTECODE a914 OP_ACTIVEBYTECODE OP_HASH160 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_OVER OP_SUB OP_ROT OP_SUB OP_0 OP_OUTPUTVALUE OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
        "source": "pragma cashscript >= 0.7.1;\n\n// v202205626\n\n// Pay equal payments at regular intervals using input locks\ncontract Annuity(\n\n    // interval for payouts, in blocks\n    int period,\n\n    // LockingBytecode of the beneficiary, the address receiving payments\n    bytes recipientLockingBytecode,\n\n    // amount paid in each installment\n    int installment,\n\n    // extra allowance for administration of contract\n    // fees are paid from executors' allowance. \n    int executorAllowance\n) {\n    function execute() {\n\n        // Check that the first output sends to the recipient\n        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n        // Check that time has passed and that time locks are enabled\n        require(tx.age >= period);\n            \n        // require the second output to match the active bytecode\n        require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));\n\n        // Get the total value on the contract\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Calculate value returned to the contract\n        int returnedValue = currentValue - installment - executorAllowance;\n\n        // Check that the outputs send the correct amounts\n        require(tx.outputs[0].value >= installment);\n        require(tx.outputs[1].value >= returnedValue);\n            \n    }\n\n}",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.579Z"
    };

    class Annuity extends BaseUtxPhiContract {
        constructor(period = 4000, address, installment, executorAllowance = 800, options = DefaultOptions) {
            let script;
            if (options.version === 1) {
                script = artifact$7;
            }
            else {
                throw Error("Unrecognized Annuity Version");
            }
            let lock = cashAddressToLockingBytecode(address);
            if (typeof (lock) === "string")
                throw lock;
            let bytecode = lock.bytecode;
            super(options.network, script, [period, bytecode, installment, executorAllowance]);
            this.period = period;
            this.address = address;
            this.installment = installment;
            this.executorAllowance = executorAllowance;
            this.options = options;
            this.options = options;
        }
        static fromString(str, network = "mainnet") {
            let comp = str.split(Annuity.delimiter);
            // if the contract shortcode doesn't match, error
            if (!(Annuity.c == comp.shift()))
                throw ("non-Annuity serialized string passed to Annuity constructor");
            let version = parseInt(comp.shift());
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = comp.splice(-1)[0];
            let period = parseInt(comp.shift());
            let lock = comp.shift();
            let prefix = getPrefixFromNetwork(network);
            let address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
            if (typeof (address) !== "string")
                throw Error("non-standard address" + address);
            let [installment, executorAllowance] = [30000, 3000];
            if (version == 1) {
                installment = parseInt(comp.shift());
                executorAllowance = parseInt(comp.shift());
            }
            else {
                throw Error("Annuity contract version not recognized");
            }
            let annuity = new Annuity(period, address, installment, executorAllowance, options);
            // check that the address 
            if (checksum !== annuity.getLockingBytecode())
                throw ("Annuity deserializtion resulted in different contract public key hash");
            return annuity;
        }
        // Create a Annunity contract from an OpReturn by building a serialized string.
        static fromOpReturn(chunks, network = "mainnet") {
            let protocol = binToHex(chunks.shift());
            if (protocol !== PROTOCOL_ID)
                throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`);
            let charArray = chunks.shift();
            let c = String.fromCharCode(charArray[0]);
            if (c !== this.c)
                throw Error(`Wrong short code passed to Annuity class: ${c}`);
            // version
            let version = binToNumber(chunks.shift());
            if (version !== 1)
                throw Error(`Wrong version code passed to Annuity class: ${version}`);
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = chunks.pop();
            let period = binToNumber(chunks.shift());
            let lock = chunks.shift();
            let prefix = getPrefixFromNetwork(network);
            let address = lockingBytecodeToCashAddress(lock, prefix);
            if (typeof (address) !== "string")
                throw Error("non-standard address" + address);
            let [installment, executorAllowance] = [30000, 3000];
            if (version == 1) {
                installment = binToNumber(chunks.shift());
                executorAllowance = binToNumber(chunks.shift());
            }
            else {
                throw Error("Annuity contract version not recognized");
            }
            let annuity = new Annuity(period, address, installment, executorAllowance, options);
            // check that the address 
            if (binToHex(checksum) !== annuity.getLockingBytecode())
                throw ("Annuity deserializtion resulted in different contract public key hash");
            return annuity;
        }
        toString() {
            return [`${Annuity.c}`,
                `${this.options.version}`,
                `${this.period}`,
                `${deriveLockingBytecodeHex(this.address)}`,
                `${this.installment}`,
                `${this.executorAllowance}`,
                `${this.getLockingBytecode()}`].join(Annuity.delimiter);
        }
        asText() {
            return `Annuity paying ${this.installment} (sat), every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`;
        }
        toChunks() {
            return [_PROTOCOL_ID,
                Annuity.c,
                toHex(this.options.version),
                toHex(this.period),
                '0x' + deriveLockingBytecodeHex(this.address),
                toHex(this.installment),
                toHex(this.executorAllowance),
                '0x' + this.getLockingBytecode()];
        }
        async execute(exAddress, fee) {
            let balance = await this.getBalance();
            if (balance == 0)
                throw Error("No funds on contract");
            let fn = this.getFunction(Annuity.fn);
            let installment = Math.round(balance - this.installment);
            let newPrincipal = balance - (this.installment + this.executorAllowance);
            let minerFee = fee ? fee : 154;
            let executorFee = balance - (installment + minerFee) - 1;
            let outputs = [
                {
                    to: this.address,
                    amount: installment
                },
                {
                    to: this.getAddress(),
                    amount: newPrincipal,
                }
            ];
            if (typeof (exAddress) === "string")
                outputs.push({
                    to: exAddress,
                    amount: executorFee
                });
            try {
                let payTx = await fn()
                    .to(outputs)
                    .withAge(this.period)
                    .withoutChange()
                    .send();
                return payTx.txid;
            }
            catch (e) {
                throw (e);
            }
        }
    }
    Annuity.c = 'A'; //A
    Annuity.delimiter = DELIMITER;
    Annuity.fn = "execute";

    // Automatically Generated
    const artifact$6 = {
        "contractName": "Divide",
        "constructorInputs": [
            {
                "name": "executorAllowance",
                "type": "int"
            },
            {
                "name": "divisor",
                "type": "int"
            },
            {
                "name": "r0LockingBytecode",
                "type": "bytes"
            },
            {
                "name": "r1LockingBytecode",
                "type": "bytes"
            }
        ],
        "abi": [
            {
                "name": "execute",
                "inputs": []
            }
        ],
        "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_SWAP OP_DIV OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
        "source": "pragma cashscript >= 0.7.0;\n  //\n  //  ** AUTOMATICALLY GENEREATED ** see: phi/script/divide.v1.js\n  //\n  // This is an experimental divider contract\n  // Splits input across a range of predetermined outputs\n  // Alpha stage, tested on regtest and testnet\n  contract Divide(\n      // allowance for party executing the contract\n      int executorAllowance,\n      // number of outputs receiving payout\n      int divisor,\n\n      // for each beneficiary, take the LockingBytecode as input\n      bytes r0LockingBytecode,\n      bytes r1LockingBytecode\n  ) {\n      function execute() {\n\n        // distributes to each output in order\n        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);\n        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);\n\n        // Get the total value of inputs\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Total value paid to beneficiaries, minus executor allowance\n        int distributedValue = currentValue - executorAllowance;\n\n        // Value paid to each beneficiary\n        int distribution = distributedValue / divisor;\n\n        // each output must be greater or equal to the distribution amount\n        require(tx.outputs[0].value >= distribution);\n        require(tx.outputs[1].value >= distribution);\n      }\n  }",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.583Z"
    };

    // Automatically Generated
    const artifact$5 = {
        "contractName": "Divide",
        "constructorInputs": [
            {
                "name": "executorAllowance",
                "type": "int"
            },
            {
                "name": "divisor",
                "type": "int"
            },
            {
                "name": "r0LockingBytecode",
                "type": "bytes"
            },
            {
                "name": "r1LockingBytecode",
                "type": "bytes"
            },
            {
                "name": "r2LockingBytecode",
                "type": "bytes"
            }
        ],
        "abi": [
            {
                "name": "execute",
                "inputs": []
            }
        ],
        "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_SWAP OP_DIV OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_2 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
        "source": "pragma cashscript >= 0.7.0;\n  //\n  //  ** AUTOMATICALLY GENEREATED ** see: phi/script/divide.v1.js\n  //\n  // This is an experimental divider contract\n  // Splits input across a range of predetermined outputs\n  // Alpha stage, tested on regtest and testnet\n  contract Divide(\n      // allowance for party executing the contract\n      int executorAllowance,\n      // number of outputs receiving payout\n      int divisor,\n\n      // for each beneficiary, take the LockingBytecode as input\n      bytes r0LockingBytecode,\n      bytes r1LockingBytecode,\n      bytes r2LockingBytecode\n  ) {\n      function execute() {\n\n        // distributes to each output in order\n        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);\n        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);\n        require(tx.outputs[2].lockingBytecode == r2LockingBytecode);\n\n        // Get the total value of inputs\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Total value paid to beneficiaries, minus executor allowance\n        int distributedValue = currentValue - executorAllowance;\n\n        // Value paid to each beneficiary\n        int distribution = distributedValue / divisor;\n\n        // each output must be greater or equal to the distribution amount\n        require(tx.outputs[0].value >= distribution);\n        require(tx.outputs[1].value >= distribution);\n        require(tx.outputs[2].value >= distribution);\n      }\n  }",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.587Z"
    };

    // Automatically Generated
    const artifact$4 = {
        "contractName": "Divide",
        "constructorInputs": [
            {
                "name": "executorAllowance",
                "type": "int"
            },
            {
                "name": "divisor",
                "type": "int"
            },
            {
                "name": "r0LockingBytecode",
                "type": "bytes"
            },
            {
                "name": "r1LockingBytecode",
                "type": "bytes"
            },
            {
                "name": "r2LockingBytecode",
                "type": "bytes"
            },
            {
                "name": "r3LockingBytecode",
                "type": "bytes"
            }
        ],
        "abi": [
            {
                "name": "execute",
                "inputs": []
            }
        ],
        "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_SWAP OP_DIV OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_2 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_3 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
        "source": "pragma cashscript >= 0.7.0;\n  //\n  //  ** AUTOMATICALLY GENEREATED ** see: phi/script/divide.v1.js\n  //\n  // This is an experimental divider contract\n  // Splits input across a range of predetermined outputs\n  // Alpha stage, tested on regtest and testnet\n  contract Divide(\n      // allowance for party executing the contract\n      int executorAllowance,\n      // number of outputs receiving payout\n      int divisor,\n\n      // for each beneficiary, take the LockingBytecode as input\n      bytes r0LockingBytecode,\n      bytes r1LockingBytecode,\n      bytes r2LockingBytecode,\n      bytes r3LockingBytecode\n  ) {\n      function execute() {\n\n        // distributes to each output in order\n        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);\n        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);\n        require(tx.outputs[2].lockingBytecode == r2LockingBytecode);\n        require(tx.outputs[3].lockingBytecode == r3LockingBytecode);\n\n        // Get the total value of inputs\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Total value paid to beneficiaries, minus executor allowance\n        int distributedValue = currentValue - executorAllowance;\n\n        // Value paid to each beneficiary\n        int distribution = distributedValue / divisor;\n\n        // each output must be greater or equal to the distribution amount\n        require(tx.outputs[0].value >= distribution);\n        require(tx.outputs[1].value >= distribution);\n        require(tx.outputs[2].value >= distribution);\n        require(tx.outputs[3].value >= distribution);\n      }\n  }",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.593Z"
    };

    const scriptMapV1 = [
        artifact$6,
        artifact$5,
        artifact$4
    ];
    class Divide extends BaseUtxPhiContract {
        constructor(executorAllowance = 1200, payees, options = DefaultOptions) {
            let scriptFn;
            if (options.version === 1) {
                scriptFn = scriptMapV1;
            }
            else {
                throw Error("Unrecognized Divide Contract Version");
            }
            let divisor = payees.length;
            if (!(divisor >= 2 && divisor <= 4))
                throw Error(`Divide contract range must be 2-4, ${(divisor)} out of range`);
            const script = scriptFn[divisor - 2];
            let payeeLocks = [...payees].map((c) => {
                let lock = cashAddressToLockingBytecode(c);
                if (typeof (lock) === "string")
                    throw lock;
                return lock.bytecode;
            });
            super(options.network, script, [executorAllowance, divisor, ...payeeLocks]);
            this.executorAllowance = executorAllowance;
            this.payees = payees;
            this.options = options;
            this.options = options;
        }
        static fromString(str, network = "mainnet") {
            let comp = str.split(Divide.delimiter);
            // if the contract shortcode doesn't match, error
            if (!(Divide.c == comp.shift()))
                throw ("non-divide (contract) serilaized string passed to divide (contract) constructor");
            let version = parseInt(comp.shift());
            if (version !== 1)
                throw Error("divide contract version not recognized");
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = comp.splice(-1)[0];
            let prefix = getPrefixFromNetwork(options.network);
            let executorAllowance = parseInt(comp.shift());
            let payeesLocks = [...comp];
            let payees = payeesLocks.map((lock) => {
                let addr = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
                if (typeof (addr) !== "string")
                    throw Error("non-standard address" + addr);
                return addr;
            });
            let divide = new Divide(executorAllowance, payees, options);
            // check that the address 
            if (!(checksum == divide.getLockingBytecode()))
                throw ("Divide deserializtion resulted in different contract address");
            return divide;
        }
        // Create a Divide contract from an OpReturn by building a serialized string.
        static fromOpReturn(chunks, network = "mainnet") {
            let protocol = binToHex(chunks.shift());
            if (protocol !== PROTOCOL_ID)
                throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`);
            let charArray = chunks.shift();
            let c = String.fromCharCode(charArray[0]);
            if (c !== this.c)
                throw Error(`Wrong short code passed to Divide class: ${c}`);
            // version
            let version = binToNumber(chunks.shift());
            if (version !== 1)
                throw Error(`Wrong version code passed to Divide class: ${version}`);
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = chunks.pop();
            let prefix = getPrefixFromNetwork(options.network);
            let executorAllowance = binToNumber(chunks.shift());
            let payeesLocks = chunks;
            let payees = payeesLocks.map((lock) => {
                let addr = lockingBytecodeToCashAddress(lock, prefix);
                if (typeof (addr) !== "string")
                    throw Error("non-standard address: " + addr);
                return addr;
            });
            let divide = new Divide(executorAllowance, payees, options);
            // check that the address 
            if (!(binToHex(checksum) == divide.getLockingBytecode()))
                throw ("Divide deserializtion resulted in different contract address");
            return divide;
        }
        toString() {
            let payees = this.payees.map((cashaddr) => deriveLockingBytecodeHex(cashaddr)).join(Divide.delimiter);
            return [`${Divide.c}`,
                `${this.options.version}`,
                `${this.executorAllowance}`,
                `${payees}`,
                `${this.getLockingBytecode()}`].join(Divide.delimiter);
        }
        asText() {
            return `A divide contract with executor allowance of ${this.executorAllowance}`;
        }
        toChunks() {
            return [
                _PROTOCOL_ID,
                Divide.c,
                toHex(this.options.version),
                toHex(this.executorAllowance),
                ...this.payees.map(a => '0x' + deriveLockingBytecodeHex(a)),
                '0x' + this.getLockingBytecode()
            ];
        }
        async execute(exAddress, fee) {
            let fn = this.getFunction(Divide.fn);
            let currentValue = await this.getBalance();
            let distributedValue = currentValue - this.executorAllowance;
            let divisor = this.payees.length;
            let feeEstimate = fee ? fee : 152 + (this.payees.length * 64);
            let installment = Math.round(distributedValue / divisor) + 2;
            if (installment < 546)
                throw ("Installment less than dust limit... bailing");
            let to = [];
            for (let i = 0; i < divisor; i++) {
                to.push({ to: this.payees[i], amount: installment });
            }
            try {
                if (exAddress) {
                    to.push({
                        to: exAddress, amount: this.executorAllowance - (feeEstimate)
                    });
                    let test = await fn()
                        .to(to)
                        .withoutChange()
                        .build();
                    let fee = test.length / 2;
                    to.pop();
                    to.push({
                        to: exAddress, amount: this.executorAllowance - (fee + 4)
                    });
                }
                let txn = fn()
                    .to(to)
                    .withoutChange()
                    .send();
                return (await txn).txid;
            }
            catch (e) {
                throw (e);
            }
        }
    }
    Divide.c = 'D';
    Divide.delimiter = DELIMITER;
    Divide.fn = "execute";

    // Automatically Generated
    const artifact$3 = {
        "contractName": "Faucet",
        "constructorInputs": [
            {
                "name": "period",
                "type": "int"
            },
            {
                "name": "payout",
                "type": "int"
            },
            {
                "name": "index",
                "type": "int"
            }
        ],
        "abi": [
            {
                "name": "drip",
                "inputs": []
            }
        ],
        "bytecode": "OP_CHECKSEQUENCEVERIFY OP_DROP OP_SWAP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTBYTECODE a914 OP_ACTIVEBYTECODE OP_HASH160 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_2DUP OP_SWAP OP_SUB OP_SWAP OP_ROT OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_DROP OP_1",
        "source": "pragma cashscript >= 0.7.0;\n\n// v20220609\n\n// This is an experimental faucet contract \n// Prelim testing on regtest, just a concept\ncontract Faucet(\n\n    // interval for payouts, in blocks\n    int period,\n\n    // amount to be paid by faucet allowance. \n    int payout,\n\n    // random number input into contract to have more than one\n    int index\n) {\n    function drip() {\n\n        // Check that time has passed and that time locks are enabled\n        require(tx.age >= period);\n            \n        // use the index\n        require(index >= 0);\n\n        // require the first output to match the active bytecode\n        require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));\n\n        // Get the total value on the contract\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Calculate value returned to the contract\n        int returnedValue = currentValue - payout;\n\n        // If the value on the contract exceeds the payout amount\n        //  then assert that the value must return to the contract\n        if(currentValue > payout){\n           require(tx.outputs[0].value >= returnedValue);\n        }\n\n    }\n\n}",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.601Z"
    };

    class Faucet extends BaseUtxPhiContract {
        constructor(period = 1, payout = 1000, index = 1, options = DefaultOptions) {
            let script;
            if (options.version === 1) {
                script = artifact$3;
            }
            else {
                throw Error("Unrecognized Faucet Version");
            }
            super(options.network, script, [period, payout, index]);
            this.period = period;
            this.payout = payout;
            this.index = index;
            this.options = options;
            this.options = options;
        }
        static fromString(str, network = "mainnet") {
            let comp = str.split(Faucet.delimiter);
            // if the contract shortcode doesn't match, error
            if (!(Faucet.c == comp.shift()))
                throw ("non-faucet serilaized string passed to faucet constructor");
            let version = parseInt(comp.shift());
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = comp.splice(-1)[0];
            let [period, payout, index] = [1, 1000, 1];
            if (version == 1) {
                period = parseInt(comp.shift());
                payout = parseInt(comp.shift());
                index = parseInt(comp.shift());
            }
            else {
                throw Error("faucet contract version not recognized");
            }
            let options = { version: version, network: network };
            let faucet = new Faucet(period, payout, index, options);
            // check that the address 
            if (!(checksum == faucet.getLockingBytecode()))
                throw ("faucet deserializtion resulted in different contract address");
            return faucet;
        }
        // Create a Faucet contract from an OpReturn by building a serialized string.
        static fromOpReturn(chunks, network = "mainnet") {
            let protocol = binToHex(chunks.shift());
            if (protocol !== PROTOCOL_ID)
                throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`);
            let charArray = chunks.shift();
            let c = String.fromCharCode(charArray[0]);
            if (c !== this.c)
                throw Error(`Wrong short code passed to Faucet class: ${c}`);
            // version
            let version = binToNumber(chunks.shift());
            if (version !== 1)
                throw Error(`Wrong version code passed to Annuity class: ${version}`);
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = chunks.pop();
            let [period, payout, index] = [4000, 120, 1];
            if (version == 1) {
                period = binToNumber(chunks.shift());
                payout = binToNumber(chunks.shift());
                index = binToNumber(chunks.shift());
            }
            else {
                throw Error("faucet contract version not recognized");
            }
            let faucet = new Faucet(period, payout, index, options);
            // check that the address 
            if (!(binToHex(checksum) == faucet.getLockingBytecode()))
                throw ("Faucet deserializtion resulted in different contract public key hash");
            return faucet;
        }
        toString() {
            return [`${Faucet.c}`,
                `${this.options.version}`,
                `${this.period}`,
                `${this.payout}`,
                `${this.index}`,
                `${this.getLockingBytecode()}`].join(Faucet.delimiter);
        }
        asText() {
            return `A faucet paying ${this.payout} (sat), every ${this.period} blocks`;
        }
        toChunks() {
            return [
                _PROTOCOL_ID,
                Faucet.c,
                toHex(this.options.version),
                toHex(this.period),
                toHex(this.payout),
                toHex(this.index),
                '0x' + this.getLockingBytecode()
            ];
        }
        async execute(exAddress, fee) {
            let balance = await this.getBalance();
            let fn = this.getFunction(Faucet.fn);
            let newPrincipal = balance - this.payout;
            let minerFee = fee ? fee : 152;
            let sendAmout = this.payout - minerFee;
            let to = [
                {
                    to: this.getAddress(),
                    amount: newPrincipal,
                }
            ];
            if (exAddress)
                to.push({
                    to: exAddress,
                    amount: sendAmout
                });
            try {
                let payTx = await fn()
                    .to(to)
                    .withAge(this.period)
                    .withoutChange()
                    .send();
                return payTx.txid;
            }
            catch (e) {
                throw (e);
            }
        }
    }
    Faucet.c = 'F';
    Faucet.delimiter = DELIMITER;
    Faucet.fn = "execute";

    // Automatically Generated
    const artifact$2 = {
        "contractName": "Mine",
        "constructorInputs": [
            {
                "name": "period",
                "type": "int"
            },
            {
                "name": "payout",
                "type": "int"
            },
            {
                "name": "difficulty",
                "type": "int"
            },
            {
                "name": "canary",
                "type": "bytes7"
            }
        ],
        "abi": [
            {
                "name": "execute",
                "inputs": [
                    {
                        "name": "nonce",
                        "type": "bytes7"
                    }
                ]
            }
        ],
        "bytecode": "OP_DUP OP_CHECKSEQUENCEVERIFY OP_DROP OP_3 OP_ROLL OP_SIZE OP_NIP OP_7 OP_NUMEQUALVERIFY OP_1 OP_1 OP_NUM2BIN OP_0 OP_7 OP_NUM2BIN OP_ACTIVEBYTECODE OP_6 OP_PICK OP_CAT OP_SHA256 OP_5 OP_PICK OP_SPLIT OP_DROP OP_SWAP OP_5 OP_PICK OP_SPLIT OP_DROP OP_EQUALVERIFY OP_7 OP_5 OP_PICK OP_CAT OP_ACTIVEBYTECODE OP_8 OP_SPLIT OP_NIP OP_CAT OP_HASH160 a914 OP_SWAP OP_CAT 87 OP_CAT 6a 7574786f OP_SIZE OP_SWAP OP_CAT OP_CAT 4d OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_ROT OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_ROT OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_2 OP_PICK OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_3 OP_ROLL OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_3 OP_ROLL OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_OVER OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_2DUP OP_SWAP OP_SUB OP_SWAP OP_ROT OP_GREATERTHAN OP_IF OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUAL OP_NIP",
        "source": "pragma cashscript >= 0.7.1;\n\n// v20220727\n\n// A faucet with proof of work.\ncontract Mine(\n\n    // interval for payouts, in blocks\n    int period,\n\n    // amount to be paid by faucet allowance. \n    int payout,\n\n    // how many leading zeros should the nonce and currenct bytecode have\n    int difficulty,\n\n    // the old nonce, which is replaced each time.\n    bytes7 canary\n) {\n    function execute(bytes7 nonce) {\n\n        // Check that time has passed and that time locks are enabled\n        require(tx.age >= period);\n            \n        // Use the old nonce \n        require(canary.length==7);\n\n        // Check that the new nonce creates a hash with difficulty leading zeros when hashed with the active bytecode\n        bytes version = byte(1);\n        bytes zeros = bytes7(0);\n        bytes hash = sha256(this.activeBytecode + bytes7(nonce));\n        require(hash.split(difficulty)[0] == zeros.split(difficulty)[0]);\n\n        // calculate the new locking bytecode\n        bytes newContract = 0x7 + bytes7(nonce) + this.activeBytecode.split(8)[1];\n        bytes20 contractHash = hash160(newContract);\n        bytes23 lockingCode = new LockingBytecodeP2SH(contractHash);\n\n\n        // Require the first output details the parameters of the mining contract in a zero value OP_RETURN\n        bytes announcement = new LockingBytecodeNullData([\n            // The protocol\n            0x7574786f,\n            // M for mining contract\n            bytes('M'),\n            // version\n            bytes(version),\n            // The period,  \n            bytes(period),\n            // The payout, \n            bytes(payout),\n            // preceeding zeros on solution\n            bytes(difficulty),\n            // The current nonce (future canary), of the mining contract funds are similtaniously sent to\n            bytes(nonce),\n            // The new bytecode\n            bytes(lockingCode)\n        ]);\n\n        // Assure that the first output matches the arguments to the contract\n        require(tx.outputs[0].lockingBytecode == announcement);\n\n        // check that the change output sends to that contract\n        require(tx.outputs[1].lockingBytecode == lockingCode);\n        \n        // Get the total value on the contract\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Calculate value returned to the contract\n        int returnedValue = currentValue - payout;\n\n        // If the value on the contract exceeds the payout amount\n        //  then assert that the value must return to the contract\n        if(currentValue > payout){\n           require(tx.outputs[1].value >= returnedValue);\n        }\n\n\n\n        // Assure it has zero value\n        require(tx.outputs[0].value == 0);\n    }\n\n}",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.618Z"
    };

    class Mine extends BaseUtxPhiContract {
        constructor(period = 1, payout = 5000, difficulty = 3, canary = new Uint8Array(7), options = DefaultOptions) {
            let script;
            if (options.version === 1) {
                script = artifact$2;
            }
            else {
                throw Error(`Unrecognized Mine Contract Version`);
            }
            super(options.network, script, [period, payout, difficulty, canary]);
            this.period = period;
            this.payout = payout;
            this.difficulty = difficulty;
            this.canary = canary;
            this.options = options;
            this.options = options;
        }
        static fromString(str, network = "mainnet") {
            let comp = str.split(this.delimiter);
            // if the contract shortcode doesn't match, error
            if (!(this.c == comp.shift()))
                throw ("non-mine serilaized string passed to mine constructor");
            let version = parseInt(comp.shift());
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = comp.splice(-1)[0];
            let [period, payout, difficulty, canary] = [5000, 120, 1, new Uint8Array(7)];
            if (version == 1) {
                period = parseInt(comp.shift());
                payout = parseInt(comp.shift());
                difficulty = parseInt(comp.shift());
                canary = hexToBin(comp.shift());
            }
            else {
                throw Error("mine contract version not recognized");
            }
            let options = { version: version, network: network };
            let mine = new Mine(period, payout, difficulty, canary, options);
            // check that the address 
            if (!(checksum == mine.getLockingBytecode()))
                throw ("mine deserializtion resulted in different contract address");
            return mine;
        }
        // Create a Mine contract from an OpReturn by building a serialized string.
        static fromOpReturn(chunks, network = "mainnet") {
            let protocol = binToHex(chunks.shift());
            if (protocol !== PROTOCOL_ID)
                throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`);
            let charArray = chunks.shift();
            let c = String.fromCharCode(charArray[0]);
            if (c !== Mine.c)
                throw Error(`Wrong short code passed to Mine class: ${c}`);
            // version
            let version = binToNumber(chunks.shift());
            if (version !== 1)
                throw Error(`Wrong version code passed to Mine class: ${version}`);
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = chunks.pop();
            let [period, payout, difficulty, canary] = [4000, 120, 1, new Uint8Array(7)];
            if (version == 1) {
                period = binToNumber(chunks.shift());
                payout = binToNumber(chunks.shift());
                difficulty = binToNumber(chunks.shift());
                canary = chunks.shift();
            }
            else {
                throw Error("mine contract version not recognized");
            }
            let mine = new Mine(period, payout, difficulty, canary, options);
            // check that the address 
            if (!(binToHex(checksum) == mine.getLockingBytecode()))
                throw ("Mine deserializtion resulted in different contract locking code");
            return mine;
        }
        toString() {
            return [`${Mine.c}`,
                `${this.options.version}`,
                `${this.period}`,
                `${this.payout}`,
                `${this.difficulty}`,
                binToHex(this.canary),
                `${this.getLockingBytecode()}`].join(Mine.delimiter);
        }
        asText() {
            return `A mineable contract, with difficulty ${this.difficulty}, paying ${this.payout} (sat), every ${this.period} blocks`;
        }
        toChunks() {
            return [
                _PROTOCOL_ID,
                Mine.c,
                toHex(this.options.version),
                toHex(this.period),
                toHex(this.payout),
                toHex(this.difficulty),
                '0x' + binToHex(this.canary),
                '0x' + this.getLockingBytecode()
            ];
        }
        async getNonce() {
            let nonce = new Uint8Array([]);
            let result = new Uint8Array([]);
            let mined = false;
            // keep mining 'til the number of zeros are reached
            while (!mined) {
                let nonceNumber = getRandomIntWeak(9007199254740991);
                nonce = bigIntToBinUintLE(BigInt(nonceNumber));
                let msg = new Uint8Array([...hexToBin(this.getRedeemScriptHex()), ...nonce]);
                result = await sha256(msg);
                if (result.slice(0, this.difficulty).reduce(sum) === 0)
                    mined = true;
            }
            // if the number is smaller than the space allowed, prepend it by adding zeros to the right
            if (nonce.length < this.canary.length) {
                let zeros = this.canary.length - nonce.length;
                nonce = new Uint8Array([...nonce, ...new Uint8Array(zeros)]);
            }
            return nonce;
        }
        async execute(exAddress, fee) {
            let balance = await this.getBalance();
            let fn = this.getFunction(Mine.fn);
            let newPrincipal = balance - this.payout;
            let minerFee = fee ? fee : 400;
            let reward = this.payout - minerFee;
            this.canary = await this.getNonce();
            let nextContract = new Mine(this.period, this.payout, this.difficulty, this.canary, this.options);
            let chunks = nextContract.toChunks();
            let to = [
                {
                    to: nextContract.getAddress(),
                    amount: newPrincipal,
                }
            ];
            if (exAddress)
                to.push({
                    to: exAddress,
                    amount: reward
                });
            let canaryHex = '0x' + binToHex(this.canary);
            try {
                let size = await fn(canaryHex)
                    .withOpReturn(chunks)
                    .to(to)
                    .withAge(this.period)
                    .withHardcodedFee(minerFee)
                    .build();
                if (exAddress) {
                    let minerFee = fee ? fee : size.length / 2;
                    let reward = this.payout - (minerFee + 4);
                    to.pop();
                    to.push({
                        to: exAddress,
                        amount: reward
                    });
                }
                let payTx = await fn(canaryHex)
                    .withOpReturn(chunks)
                    .to(to)
                    .withAge(this.period)
                    .withoutChange()
                    .send();
                return payTx.txid;
            }
            catch (e) {
                throw (e);
            }
        }
    }
    Mine.c = 'M';
    Mine.delimiter = DELIMITER;
    Mine.fn = "execute";

    // Automatically Generated
    const artifact$1 = {
        "contractName": "Perpetuity",
        "constructorInputs": [
            {
                "name": "period",
                "type": "int"
            },
            {
                "name": "recipientLockingBytecode",
                "type": "bytes"
            },
            {
                "name": "executorAllowance",
                "type": "int"
            },
            {
                "name": "decay",
                "type": "int"
            }
        ],
        "abi": [
            {
                "name": "execute",
                "inputs": []
            }
        ],
        "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_CHECKSEQUENCEVERIFY OP_DROP OP_1 OP_OUTPUTBYTECODE a914 OP_ACTIVEBYTECODE OP_HASH160 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_DUP OP_3 OP_ROLL OP_DIV OP_SWAP OP_OVER OP_SUB OP_ROT OP_SUB OP_0 OP_OUTPUTVALUE OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
        "source": "pragma cashscript >= 0.7.1;\n\n// v20220522\n\n// This is an experimental perpetuity contract \n// Prelim testing on regtest, just a concept\ncontract Perpetuity(\n\n    // interval for payouts, in blocks\n    int period,\n\n    // lockingBytecode of the beneficiary, the address receiving payments\n    bytes recipientLockingBytecode,\n\n    // extra allowance for administration of contract\n    // fees are paid from executors' allowance. \n    int executorAllowance,\n\n    // divisor for the payout, each payout must be greater than the total\n    // amount held on the contract divided by this number\n    int decay\n) {\n    function execute() {\n\n        // Check that the first output sends to the recipient\n        require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n        // Check that time has passed and that time locks are enabled\n        require(tx.age >= period);\n            \n        // require the second output to match the active bytecode\n        require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));\n\n\n        // Get the total value on the contract\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // The payout is the current value divided by the decay\n        int installment = currentValue/decay;\n\n        // Calculate value returned to the contract\n        int returnedValue = currentValue - installment - executorAllowance;\n\n        // Check that the outputs send the correct amounts\n        require(tx.outputs[0].value >= installment);\n        require(tx.outputs[1].value >= returnedValue);\n            \n    }\n\n}",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.623Z"
    };

    class Perpetuity extends BaseUtxPhiContract {
        constructor(period = 4000, address, executorAllowance, decay, options = DefaultOptions) {
            let script;
            if (options.version === 1) {
                script = artifact$1;
            }
            else {
                throw Error("Unrecognized Perpetuity Version");
            }
            let lock = cashAddressToLockingBytecode(address);
            if (typeof (lock) === "string")
                throw lock;
            let bytecode = lock.bytecode;
            super(options.network, script, [period, bytecode, executorAllowance, decay]);
            this.period = period;
            this.address = address;
            this.executorAllowance = executorAllowance;
            this.decay = decay;
            this.options = options;
            this.options = options;
        }
        static fromString(str, network = "mainnet") {
            let comp = str.split(Perpetuity.delimiter);
            // if the contract shortcode doesn't match, error
            if (!(Perpetuity.c == comp.shift()))
                throw ("non-Perpetuity serialized string passed to Perpetuity constructor");
            let version = parseInt(comp.shift());
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = comp.splice(-1)[0];
            let period = parseInt(comp.shift());
            let lock = comp.shift();
            let prefix = getPrefixFromNetwork(network);
            let address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
            if (typeof (address) !== "string")
                throw Error("non-standard address" + address);
            let [executorAllowance, decay] = [3000, 120];
            if (version == 1) {
                executorAllowance = parseInt(comp.shift());
                decay = parseInt(comp.shift());
            }
            else {
                throw Error("Perpetuity contract version not recognized");
            }
            let perpetuity = new Perpetuity(period, address, executorAllowance, decay, options);
            // check that the address matches
            if (!(checksum == deriveLockingBytecodeHex(perpetuity.getAddress())))
                throw ("Perpetuity deserializtion resulted in different contract public key hash");
            return perpetuity;
        }
        // Create a Perpetuity contract from an OpReturn by building a serialized string.
        static fromOpReturn(chunks, network = "mainnet") {
            let protocol = binToHex(chunks.shift());
            if (protocol !== PROTOCOL_ID)
                throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`);
            let charArray = chunks.shift();
            let c = String.fromCharCode(charArray[0]);
            if (c !== this.c)
                throw Error(`Wrong short code passed to Perpetuity class: ${c}`);
            // version
            let version = binToNumber(chunks.shift());
            if (version !== 1)
                throw Error(`Wrong version code passed to Perpetuity class: ${version}`);
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = chunks.pop();
            let period = binToNumber(chunks.shift());
            let lock = chunks.shift();
            let prefix = getPrefixFromNetwork(network);
            let address = lockingBytecodeToCashAddress(lock, prefix);
            JSON.stringify(address);
            if (typeof (address) !== "string")
                throw Error("non-standard address" + address);
            let [executorAllowance, decay] = [3000, 120];
            if (version == 1) {
                executorAllowance = binToNumber(chunks.shift());
                decay = binToNumber(chunks.shift());
            }
            else {
                throw Error("Perpetuity contract version not recognized");
            }
            let perpetuity = new Perpetuity(period, address, executorAllowance, decay, options);
            // check that the address 
            if (binToHex(checksum) !== deriveLockingBytecodeHex(perpetuity.getAddress()))
                throw ("Perpetuity deserializtion resulted in different contract public key hash");
            return perpetuity;
        }
        toString() {
            return [`${Perpetuity.c}`,
                `${this.options.version}`,
                `${this.period}`,
                `${deriveLockingBytecodeHex(this.address)}`,
                `${this.executorAllowance}`,
                `${this.decay}`,
                `${this.getLockingBytecode()}`].join(Perpetuity.delimiter);
        }
        asText() {
            return `Perpetuity to pay 1/${this.decay} the input, every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`;
        }
        toChunks() {
            return [_PROTOCOL_ID,
                Perpetuity.c,
                toHex(this.options.version),
                toHex(this.period),
                '0x' + deriveLockingBytecodeHex(this.address),
                toHex(this.executorAllowance),
                toHex(this.decay),
                '0x' + this.getLockingBytecode()];
        }
        async execute(exAddress, fee) {
            let balance = await this.getBalance();
            if (balance == 0)
                throw Error("No funds on contract");
            let fn = this.getFunction(Perpetuity.fn);
            let installment = Math.round(balance / this.decay);
            let newPrincipal = balance - (installment + this.executorAllowance);
            let minerFee = fee ? fee : 154;
            let executorFee = balance - (installment + newPrincipal + minerFee) - 1;
            let outputs = [
                {
                    to: this.address,
                    amount: installment
                },
                {
                    to: this.getAddress(),
                    amount: newPrincipal,
                }
            ];
            if (typeof (exAddress) === "string" && exAddress)
                outputs.push({
                    to: exAddress,
                    amount: executorFee
                });
            try {
                let payTx1 = await fn()
                    .to(outputs)
                    .withAge(this.period)
                    .withoutChange()
                    .build();
                console.log(payTx1);
                let payTx = await fn()
                    .to(outputs)
                    .withAge(this.period)
                    .withoutChange()
                    .send();
                return payTx.txid;
            }
            catch (e) {
                throw (e);
            }
        }
    }
    Perpetuity.c = "P";
    Perpetuity.delimiter = DELIMITER;
    Perpetuity.fn = "execute";

    // Automatically Generated
    const artifact = {
        "contractName": "Record",
        "constructorInputs": [
            {
                "name": "maxFee",
                "type": "int"
            },
            {
                "name": "index",
                "type": "int"
            }
        ],
        "abi": [
            {
                "name": "execute",
                "inputs": [
                    {
                        "name": "dataHash",
                        "type": "bytes20"
                    }
                ]
            }
        ],
        "bytecode": "OP_SWAP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTBYTECODE OP_HASH160 OP_ROT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY a200 OP_0 OP_OUTPUTBYTECODE OP_SIZE OP_NIP OP_ADD OP_DUP OP_ROT OP_LESSTHANOREQUAL OP_VERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
        "source": "pragma cashscript ^0.7.0;\n\n/* Publishes a utxfi record under the protocol 0x62616e6b\n */\n\n \ncontract Record(int maxFee, int index) {\n    function execute(bytes20 dataHash) {\n\n        // this does nothing\n        // different indicies enable different contract addresses\n        require(index >= 0);\n\n        // Check that the first tx output is a zero value opcode matching the provided hash\n        require(hash160(tx.outputs[0].lockingBytecode) == dataHash);\n        require(tx.outputs[0].value == 0);\n        \n        // calculate the fee required to propagate the transaction 1 sat/ byte\n        int baseFee = 162;\n        int fee = baseFee + tx.outputs[0].lockingBytecode.length;\n        require(fee<=maxFee);\n\n        // Check that the second tx output sends the change back\n        int newValue = tx.inputs[this.activeInputIndex].value - fee;\n        require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\n        require(tx.outputs[1].value >= newValue);                \n    }\n}",
        "compiler": {
            "name": "cashc",
            "version": "0.7.2"
        },
        "updatedAt": "2022-09-21T19:02:37.630Z"
    };

    class Record extends BaseUtxPhiContract {
        constructor(maxFee = 850, index = 0, options = DefaultOptions) {
            let script;
            if (options.version === 1) {
                script = artifact;
            }
            else {
                throw Error("Unrecognized Divide Contract Version");
            }
            super(options.network, script, [maxFee, index]);
            this.maxFee = maxFee;
            this.index = index;
            this.options = options;
            this.options = options;
        }
        static fromString(str, network = "mainnet") {
            let comp = str.split(Record.delimiter);
            // if the contract shortcode doesn't match, error
            if (!(Record.c == comp.shift()))
                throw ("non-record (contract) serilaized string passed to record (contract) constructor");
            let version = parseInt(comp.shift());
            if (version !== 1)
                throw Error("record contract version not recognized");
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = comp.splice(-1)[0];
            let maxFee = parseInt(comp.shift());
            let index = parseInt(comp.shift());
            let record = new Record(maxFee, index, options);
            // check that the address 
            if (!(checksum == record.getLockingBytecode()))
                throw ("Divide deserializtion resulted in different contract address");
            return record;
        }
        toString() {
            return [`${Record.c}`,
                `${this.options.version}`,
                `${this.maxFee}`,
                `${this.index}`,
                `${this.getLockingBytecode()}`].join(Record.delimiter);
        }
        asText() {
            return `Recording contract with up to ${this.maxFee} per broadcast, index ${this.index}`;
        }
        toChunks() {
            return [
                _PROTOCOL_ID,
                Record.c,
                toHex(this.options.version),
                toHex(this.maxFee),
                toHex(this.index),
                '0x' + this.getLockingBytecode()
            ];
        }
        // Create a Record contract from an OpReturn by building a serialized string.
        static fromOpReturn(chunks, network = "mainnet") {
            let protocol = binToHex(chunks.shift());
            if (protocol !== PROTOCOL_ID)
                throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`);
            let charArray = chunks.shift();
            let c = String.fromCharCode(charArray[0]);
            if (c !== this.c)
                throw Error(`Wrong short code passed to Record class: ${c} v. ${this.c}`);
            // version
            let version = binToNumber(chunks.shift());
            if (version !== 1)
                throw Error(`Wrong version code passed to Record class: ${version}`);
            let options = { version: version, network: network };
            // split off the last argument, the address pkh, save it as the checksum
            let checksum = chunks.pop();
            let [maxFee, index] = [850, 0];
            if (version == 1) {
                maxFee = binToNumber(chunks.shift());
                index = binToNumber(chunks.shift());
            }
            else {
                throw Error("Record contract version not recognized");
            }
            let record = new Record(maxFee, index, options);
            // check that the address 
            if (binToHex(checksum) !== record.getLockingBytecode())
                throw ("Record deserializtion resulted in different contract public key hash");
            return record;
        }
        async broadcast(data) {
            if (!await this.isFunded())
                throw (`Record contract is not funded, ${this.getAddress()}`);
            data = data ? data : this.toChunks();
            let fn = this.getFunction(Record.fn);
            let opReturn = createOpReturnData(data);
            try {
                if (typeof opReturn === "string")
                    throw opReturn;
                let checkHash = await hash160(opReturn);
                let size = (await fn(checkHash)
                    .withOpReturn(data)
                    .withHardcodedFee(369)
                    .build()).length;
                let txn = await fn(checkHash)
                    .withOpReturn(data)
                    .withHardcodedFee(size / 2)
                    .send();
                return txn;
            }
            catch (e) {
                throw (e);
            }
        }
    }
    Record.c = 'R';
    Record.delimiter = DELIMITER;
    Record.fn = "execute";

    const contractMap = {
        A: Annuity,
        D: Divide,
        F: Faucet,
        M: Mine,
        P: Perpetuity,
        R: Record
    };

    function opReturnToInstance(serialized, network) {
        if (typeof serialized === "string") {
            serialized = hexToBin(serialized);
        }
        let serializedBinChunks = decodeNullDataScript(serialized);
        let contractCode = binToHex(serializedBinChunks[1]);
        let code = String.fromCharCode(parseInt(contractCode, 16));
        try {
            let instance = contractMap[code].fromOpReturn(serializedBinChunks, network);
            return instance;
        }
        catch (e) {
            console.warn(`Couldn't parse serialized contract ${e}`);
            return;
        }
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    // eslint-disable-next-line func-names
    var kindOf = (function(cache) {
      // eslint-disable-next-line func-names
      return function(thing) {
        var str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
      };
    })(Object.create(null));

    function kindOfTest(type) {
      type = type.toLowerCase();
      return function isKindOf(thing) {
        return kindOf(thing) === type;
      };
    }

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return Array.isArray(val);
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
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    var isArrayBuffer = kindOfTest('ArrayBuffer');


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
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
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
      if (kindOf(val) !== 'object') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    var isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    var isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    var isFileList = kindOfTest('FileList');

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
     * Determine if a value is a FormData
     *
     * @param {Object} thing The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(thing) {
      var pattern = '[object FormData]';
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) ||
        toString.call(thing) === pattern ||
        (isFunction(thing.toString) && thing.toString() === pattern)
      );
    }

    /**
     * Determine if a value is a URLSearchParams object
     * @function
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    var isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
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
          a[key] = bind(val, thisArg);
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

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     */

    function inherits(constructor, superConstructor, props, descriptors) {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      props && Object.assign(constructor.prototype, props);
    }

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function} [filter]
     * @returns {Object}
     */

    function toFlatObject(sourceObj, destObj, filter) {
      var props;
      var i;
      var prop;
      var merged = {};

      destObj = destObj || {};

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if (!merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = Object.getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    }

    /*
     * determines whether a string ends with the characters of a specified string
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     * @returns {boolean}
     */
    function endsWith(str, searchString, position) {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      var lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }


    /**
     * Returns new array from array like object
     * @param {*} [thing]
     * @returns {Array}
     */
    function toArray(thing) {
      if (!thing) return null;
      var i = thing.length;
      if (isUndefined(i)) return null;
      var arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    }

    // eslint-disable-next-line func-names
    var isTypedArray = (function(TypedArray) {
      // eslint-disable-next-line func-names
      return function(thing) {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

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
      stripBOM: stripBOM,
      inherits: inherits,
      toFlatObject: toFlatObject,
      kindOf: kindOf,
      kindOfTest: kindOfTest,
      endsWith: endsWith,
      toArray: toArray,
      isTypedArray: isTypedArray,
      isFileList: isFileList
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
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
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

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);
      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
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
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    var prototype = AxiosError.prototype;
    var descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED'
    // eslint-disable-next-line func-names
    ].forEach(function(code) {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = function(error, code, config, request, response, customProps) {
      var axiosError = Object.create(prototype);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    var AxiosError_1 = AxiosError;

    var transitional = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    /**
     * Convert a data object to FormData
     * @param {Object} obj
     * @param {?Object} [formData]
     * @returns {Object}
     **/

    function toFormData(obj, formData) {
      // eslint-disable-next-line no-param-reassign
      formData = formData || new FormData();

      var stack = [];

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      function build(data, parentKey) {
        if (utils.isPlainObject(data) || utils.isArray(data)) {
          if (stack.indexOf(data) !== -1) {
            throw Error('Circular reference detected in ' + parentKey);
          }

          stack.push(data);

          utils.forEach(data, function each(value, key) {
            if (utils.isUndefined(value)) return;
            var fullKey = parentKey ? parentKey + '.' + key : key;
            var arr;

            if (value && !parentKey && typeof value === 'object') {
              if (utils.endsWith(key, '{}')) {
                // eslint-disable-next-line no-param-reassign
                value = JSON.stringify(value);
              } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
                // eslint-disable-next-line func-names
                arr.forEach(function(el) {
                  !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
                });
                return;
              }
            }

            build(value, fullKey);
          });

          stack.pop();
        } else {
          formData.append(parentKey, convertValue(data));
        }
      }

      build(obj);

      return formData;
    }

    var toFormData_1 = toFormData;

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
        reject(new AxiosError_1(
          'Request failed with status code ' + response.status,
          [AxiosError_1.ERR_BAD_REQUEST, AxiosError_1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
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
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
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

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function CanceledError(message) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError_1.call(this, message == null ? 'canceled' : message, AxiosError_1.ERR_CANCELED);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError_1, {
      __CANCEL__: true
    });

    var CanceledError_1 = CanceledError;

    var parseProtocol = function parseProtocol(url) {
      var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    };

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
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
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError_1('Request aborted', AxiosError_1.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError_1('Network Error', AxiosError_1.ERR_NETWORK, config, request, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional$1 = config.transitional || transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError_1(
            timeoutErrorMessage,
            transitional$1.clarifyTimeoutError ? AxiosError_1.ETIMEDOUT : AxiosError_1.ECONNABORTED,
            config,
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
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new CanceledError_1() : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        var protocol = parseProtocol(fullPath);

        if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
          reject(new AxiosError_1('Unsupported protocol ' + protocol + ':', AxiosError_1.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData);
      });
    };

    // eslint-disable-next-line strict
    var _null = null;

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

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: transitional,

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

        var isObjectPayload = utils.isObject(data);
        var contentType = headers && headers['Content-Type'];

        var isFileList;

        if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
          var _FormData = this.env && this.env.FormData;
          return toFormData_1(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
        } else if (isObjectPayload || contentType === 'application/json') {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError_1.from(e, AxiosError_1.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
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

      env: {
        FormData: _null
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
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
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults_1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError_1();
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
      config.data = transformData.call(
        config,
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
        response.data = transformData.call(
          config,
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
            reason.response.data = transformData.call(
              config,
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

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'beforeRedirect': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data = {
      "version": "0.27.2"
    };

    var VERSION = data.version;


    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new AxiosError_1(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError_1.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError_1('options must be an object', AxiosError_1.ERR_BAD_OPTION_VALUE);
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError_1('option ' + opt + ' must be ' + result, AxiosError_1.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError_1('Unknown option ' + opt, AxiosError_1.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions: assertOptions,
      validators: validators$1
    };

    var validators = validator.validators;
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
    Axios.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
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

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      var fullPath = buildFullPath(config.baseURL, config.url);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method: method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url: url,
            data: data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios_1 = Axios;

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

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
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
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios$1 = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios$1.Axios = Axios_1;

    // Expose Cancel & CancelToken
    axios$1.CanceledError = CanceledError_1;
    axios$1.CancelToken = CancelToken_1;
    axios$1.isCancel = isCancel;
    axios$1.VERSION = data.version;
    axios$1.toFormData = toFormData_1;

    // Expose AxiosError class
    axios$1.AxiosError = AxiosError_1;

    // alias for CanceledError for backward compatibility
    axios$1.Cancel = axios$1.CanceledError;

    // Expose all/spread
    axios$1.all = function all(promises) {
      return Promise.all(promises);
    };
    axios$1.spread = spread;

    // Expose isAxiosError
    axios$1.isAxiosError = isAxiosError;

    var axios_1 = axios$1;

    // Allow use of default import syntax in TypeScript
    var _default = axios$1;
    axios_1.default = _default;

    var axios = axios_1;

    async function getUnspent(host, prefix, node) {
        prefix = prefix ? prefix : "6a04" + PROTOCOL_ID;
        node = node ? node : "bchn";
        let response = await axios({
            url: host,
            method: 'post',
            data: {
                query: `query SearchOutputsByLockingBytecodePrefix($prefix: String!, $node: String!) {
                search_output_prefix(args: {locking_bytecode_prefix_hex: $prefix}, distinct_on: locking_bytecode, where: {transaction: {block_inclusions: {block: {accepted_by: {node: {name: {_eq: $node}}}}}}}) {
                  locking_bytecode
                }
              }`,
                variables: {
                    prefix: prefix,
                    node: node
                }
            }
        }).catch((e) => {
            throw e;
        });
        // raise errors from chaingraph
        if (response.data.error || response.data.errors) {
            if (response.data.error) {
                throw Error(response.data.error);
            }
            else {
                throw Error(response.data.errors[0].message);
            }
        }
        let results = response.data.data["search_output_prefix"];
        // transform list of objects to a list of strings
        results = results.map((val) => { return val.locking_bytecode; });
        results = results.map((x) => x.replace('\\x', ''));
        return results;
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const loaderStore = writable(undefined);
    async function load(loader) {
        loaderStore.set(loader);
        setTimeout(async () => await loader
            .load()
            .then(() => loaderStore.set(undefined))
            .catch(() => {
            var _a;
            (_a = loader.onError) === null || _a === void 0 ? void 0 : _a.call(loader);
            loaderStore.set(undefined);
        }), 50 // TODO: HACK to get loading screen to show
        );
    }

    /* src/Contract.svelte generated by Svelte v3.50.1 */
    const file$3 = "src/Contract.svelte";

    // (25:4) {#if instance}
    function create_if_block$2(ctx) {
    	let p0;
    	let t0_value = /*instance*/ ctx[0].toString() + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*instance*/ ctx[0].asText() + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*instance*/ ctx[0].getAddress() + "";
    	let t4;
    	let t5;
    	let p3;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let button0;
    	let t11;
    	let p4;
    	let t12;
    	let t13;
    	let t14;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p3 = element("p");
    			t6 = text("Balance: ");
    			t7 = text(/*balance*/ ctx[1]);
    			t8 = text(" sats");
    			t9 = space();
    			button0 = element("button");
    			button0.textContent = "Update";
    			t11 = space();
    			p4 = element("p");
    			t12 = text("Published: ");
    			t13 = text(/*broadcastTxn*/ ctx[2]);
    			t14 = space();
    			button1 = element("button");
    			button1.textContent = "Record";
    			add_location(p0, file$3, 25, 3, 589);
    			add_location(p1, file$3, 26, 3, 621);
    			add_location(p2, file$3, 27, 3, 651);
    			add_location(p3, file$3, 28, 6, 688);
    			add_location(button0, file$3, 28, 40, 722);
    			add_location(p4, file$3, 29, 6, 774);
    			add_location(button1, file$3, 29, 43, 811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t6);
    			append_dev(p3, t7);
    			append_dev(p3, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t12);
    			append_dev(p4, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*getBalance*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*broadcast*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*instance*/ 1 && t0_value !== (t0_value = /*instance*/ ctx[0].toString() + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*instance*/ 1 && t2_value !== (t2_value = /*instance*/ ctx[0].asText() + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*instance*/ 1 && t4_value !== (t4_value = /*instance*/ ctx[0].getAddress() + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*balance*/ 2) set_data_dev(t7, /*balance*/ ctx[1]);
    			if (dirty & /*broadcastTxn*/ 4) set_data_dev(t13, /*broadcastTxn*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:4) {#if instance}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let if_block = /*instance*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			add_location(div, file$3, 23, 0, 561);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*instance*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
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

    function instance_1$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contract', slots, []);
    	let { instance } = $$props;
    	let balance = NaN;
    	let broadcastTxn = "";

    	const getBalance = async () => {
    		await load({
    			load: async () => {
    				$$invalidate(1, balance = await instance.getBalance());
    			}
    		});
    	};

    	const broadcast = async () => {
    		await load({
    			load: async () => {
    				let r = new Record();
    				let tx = await r.broadcast(instance.toChunks());
    				$$invalidate(2, broadcastTxn = tx.txId);
    			}
    		});
    	};

    	const writable_props = ['instance'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contract> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('instance' in $$props) $$invalidate(0, instance = $$props.instance);
    	};

    	$$self.$capture_state = () => ({
    		Record,
    		load,
    		instance,
    		balance,
    		broadcastTxn,
    		getBalance,
    		broadcast
    	});

    	$$self.$inject_state = $$props => {
    		if ('instance' in $$props) $$invalidate(0, instance = $$props.instance);
    		if ('balance' in $$props) $$invalidate(1, balance = $$props.balance);
    		if ('broadcastTxn' in $$props) $$invalidate(2, broadcastTxn = $$props.broadcastTxn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [instance, balance, broadcastTxn, getBalance, broadcast];
    }

    class Contract extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance_1$2, create_fragment$3, safe_not_equal, { instance: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contract",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*instance*/ ctx[0] === undefined && !('instance' in props)) {
    			console.warn("<Contract> was created without expected prop 'instance'");
    		}
    	}

    	get instance() {
    		throw new Error("<Contract>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set instance(value) {
    		throw new Error("<Contract>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ContractItem.svelte generated by Svelte v3.50.1 */

    const { Object: Object_1$1, console: console_1$1 } = globals;
    const file$2 = "src/ContractItem.svelte";

    // (44:4) {#if instance}
    function create_if_block$1(ctx) {
    	let contract;
    	let current;

    	contract = new Contract({
    			props: { instance: /*instance*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contract.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contract, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contract_changes = {};
    			if (dirty & /*instance*/ 2) contract_changes.instance = /*instance*/ ctx[1];
    			contract.$set(contract_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contract.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contract.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contract, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(44:4) {#if instance}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let button;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*instance*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Parse";
    			t1 = space();
    			t2 = text(/*opReturn*/ ctx[0]);
    			t3 = space();
    			if (if_block) if_block.c();
    			add_location(button, file$2, 39, 4, 925);
    			add_location(div, file$2, 38, 0, 915);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*init*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*opReturn*/ 1) set_data_dev(t2, /*opReturn*/ ctx[0]);

    			if (/*instance*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*instance*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
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
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
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

    function instance_1$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContractItem', slots, []);
    	let { opReturn } = $$props;
    	let instance;

    	let contractList = Object.keys(contractMap).map(k => {
    		contractMap[k];
    	});

    	const init = async () => {
    		await load({
    			load: async () => {
    				$$invalidate(1, instance = opReturnToInstance(opReturn));
    			}
    		});
    	};

    	const handleSubmit = async x => {
    		await load({
    			load: async x => {
    				console.log(x.toString());
    				$$invalidate(1, instance = opReturnToInstance(opReturn));
    			}
    		});
    	};

    	afterUpdate(() => {
    	});

    	const writable_props = ['opReturn'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<ContractItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('opReturn' in $$props) $$invalidate(0, opReturn = $$props.opReturn);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		opReturnToInstance,
    		contractMap,
    		load,
    		Contract,
    		opReturn,
    		instance,
    		contractList,
    		init,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('opReturn' in $$props) $$invalidate(0, opReturn = $$props.opReturn);
    		if ('instance' in $$props) $$invalidate(1, instance = $$props.instance);
    		if ('contractList' in $$props) contractList = $$props.contractList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [opReturn, instance, init];
    }

    class ContractItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance_1$1, create_fragment$2, safe_not_equal, { opReturn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContractItem",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*opReturn*/ ctx[0] === undefined && !('opReturn' in props)) {
    			console_1$1.warn("<ContractItem> was created without expected prop 'opReturn'");
    		}
    	}

    	get opReturn() {
    		throw new Error("<ContractItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opReturn(value) {
    		throw new Error("<ContractItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ContractInit.svelte generated by Svelte v3.50.1 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$1 = "src/ContractInit.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (18:4) {#if !instance}
    function create_if_block_1(ctx) {
    	let form;
    	let select;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*contractList*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			button.textContent = "Create";
    			if (/*selected*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$1, 19, 12, 547);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 27, 12, 869);
    			add_location(form, file$1, 18, 8, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[1]);
    			append_dev(form, t0);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[4]),
    					listen_dev(select, "change", /*change_handler*/ ctx[5], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*contractList*/ 4) {
    				each_value = /*contractList*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, contractList*/ 6) {
    				select_option(select, /*selected*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:4) {#if !instance}",
    		ctx
    	});

    	return block;
    }

    // (21:16) {#each contractList as contract }
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*contract*/ ctx[6].class.name + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*contract*/ ctx[6].class;
    			option.value = option.__value;
    			add_location(option, file$1, 21, 20, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(21:16) {#each contractList as contract }",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if instance}
    function create_if_block(ctx) {
    	let contract;
    	let current;

    	contract = new Contract({
    			props: { instance: /*instance*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contract.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contract, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contract_changes = {};
    			if (dirty & /*instance*/ 1) contract_changes.instance = /*instance*/ ctx[0];
    			contract.$set(contract_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contract.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contract.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contract, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:4) {#if instance}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t;
    	let current;
    	let if_block0 = !/*instance*/ ctx[0] && create_if_block_1(ctx);
    	let if_block1 = /*instance*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			add_location(div, file$1, 15, 0, 453);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*instance*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*instance*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*instance*/ 1) {
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
    			if (if_block0) if_block0.d();
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

    function instance_1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContractInit', slots, []);
    	let { instance } = $$props;
    	let selected;

    	let contractList = Object.keys(contractMap).map(k => {
    		console.log(contractMap[k]);
    		return { "code": k, "class": contractMap[k] };
    	});

    	const handleSubmit = async () => {
    		await load({
    			load: async () => {
    				
    			}
    		});
    	};

    	const writable_props = ['instance'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ContractInit> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(1, selected);
    		$$invalidate(2, contractList);
    	}

    	const change_handler = () => $$invalidate(0, instance = new selected());

    	$$self.$$set = $$props => {
    		if ('instance' in $$props) $$invalidate(0, instance = $$props.instance);
    	};

    	$$self.$capture_state = () => ({
    		contractMap,
    		load,
    		Contract,
    		instance,
    		selected,
    		contractList,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('instance' in $$props) $$invalidate(0, instance = $$props.instance);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('contractList' in $$props) $$invalidate(2, contractList = $$props.contractList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		instance,
    		selected,
    		contractList,
    		handleSubmit,
    		select_change_handler,
    		change_handler
    	];
    }

    class ContractInit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance_1, create_fragment$1, safe_not_equal, { instance: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContractInit",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*instance*/ ctx[0] === undefined && !('instance' in props)) {
    			console_1.warn("<ContractInit> was created without expected prop 'instance'");
    		}
    	}

    	get instance() {
    		throw new Error("<ContractInit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set instance(value) {
    		throw new Error("<ContractInit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.50.1 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (55:4) {#each contracts as cat}
    function create_each_block(ctx) {
    	let li;
    	let contractitem;
    	let t;
    	let current;

    	contractitem = new ContractItem({
    			props: { opReturn: /*cat*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(contractitem.$$.fragment);
    			t = space();
    			add_location(li, file, 55, 4, 1785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(contractitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contractitem_changes = {};
    			if (dirty & /*contracts*/ 1) contractitem_changes.opReturn = /*cat*/ ctx[8];
    			contractitem.$set(contractitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contractitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contractitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(contractitem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(55:4) {#each contracts as cat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let button;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let input2;
    	let t4;
    	let br;
    	let t5;
    	let ul;
    	let t6;
    	let hr;
    	let t7;
    	let contract;
    	let t8;
    	let contractinit;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*contracts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	contract = new Contract({ $$inline: true });
    	contractinit = new ContractInit({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			button.textContent = "Query";
    			t1 = text("\n\tProtocol: ");
    			input0 = element("input");
    			t2 = text("\n\tChaingraph: ");
    			input1 = element("input");
    			t3 = text("\n\tNode: ");
    			input2 = element("input");
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			hr = element("hr");
    			t7 = space();
    			create_component(contract.$$.fragment);
    			t8 = space();
    			create_component(contractinit.$$.fragment);
    			add_location(button, file, 44, 1, 1481);
    			set_style(input0, "width", "100px");
    			add_location(input0, file, 47, 11, 1544);
    			set_style(input1, "width", "400px");
    			add_location(input1, file, 48, 13, 1608);
    			set_style(input2, "width", "100px");
    			add_location(input2, file, 49, 7, 1662);
    			add_location(br, file, 50, 1, 1711);
    			add_location(ul, file, 52, 1, 1719);
    			add_location(hr, file, 62, 1, 1887);
    			add_location(main, file, 42, 0, 1472);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(main, t1);
    			append_dev(main, input0);
    			set_input_value(input0, /*protocol*/ ctx[1]);
    			append_dev(main, t2);
    			append_dev(main, input1);
    			set_input_value(input1, /*host*/ ctx[2]);
    			append_dev(main, t3);
    			append_dev(main, input2);
    			set_input_value(input2, /*node*/ ctx[3]);
    			append_dev(main, t4);
    			append_dev(main, br);
    			append_dev(main, t5);
    			append_dev(main, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(main, t6);
    			append_dev(main, hr);
    			append_dev(main, t7);
    			mount_component(contract, main, null);
    			append_dev(main, t8);
    			mount_component(contractinit, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*addContracts*/ ctx[4], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*protocol*/ 2 && input0.value !== /*protocol*/ ctx[1]) {
    				set_input_value(input0, /*protocol*/ ctx[1]);
    			}

    			if (dirty & /*host*/ 4 && input1.value !== /*host*/ ctx[2]) {
    				set_input_value(input1, /*host*/ ctx[2]);
    			}

    			if (dirty & /*node*/ 8 && input2.value !== /*node*/ ctx[3]) {
    				set_input_value(input2, /*node*/ ctx[3]);
    			}

    			if (dirty & /*contracts*/ 1) {
    				each_value = /*contracts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(contract.$$.fragment, local);
    			transition_in(contractinit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(contract.$$.fragment, local);
    			transition_out(contractinit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			destroy_component(contract);
    			destroy_component(contractinit);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let contracts = [];
    	let protocol = "utxo";
    	let host = 'https://demo.chaingraph.cash/v1/graphql';
    	let node = "bchn";

    	const addContracts = async () => {
    		await load({
    			load: async () => {
    				//contracts = await getUnspent(host, "6a0462616e6b" , "bchn")
    				let protocolHex = protocol.split('').map(el => el.charCodeAt(0).toString(16)).join('');

    				let contractHex = await getUnspent(host, "6a04" + protocolHex, node);
    				let contractData = contractHex.map(x => decodeNullDataScript(x));

    				$$invalidate(0, contracts = contractData.map(x => {
    					// discard protocol
    					x.shift();

    					let code = String.fromCharCode(x.shift());
    					let version = binToNumber(x.shift());
    					let lockingBytecode = x.pop();

    					return {
    						code,
    						version,
    						params: x,
    						lockingBytecode
    					};
    				}));
    			}
    		});
    	};

    	afterUpdate(() => {
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		protocol = this.value;
    		$$invalidate(1, protocol);
    	}

    	function input1_input_handler() {
    		host = this.value;
    		$$invalidate(2, host);
    	}

    	function input2_input_handler() {
    		node = this.value;
    		$$invalidate(3, node);
    	}

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		getUnspent,
    		decodeNullDataScript,
    		binToNumber,
    		load,
    		ContractItem,
    		ContractInit,
    		Contract,
    		contracts,
    		protocol,
    		host,
    		node,
    		addContracts
    	});

    	$$self.$inject_state = $$props => {
    		if ('contracts' in $$props) $$invalidate(0, contracts = $$props.contracts);
    		if ('protocol' in $$props) $$invalidate(1, protocol = $$props.protocol);
    		if ('host' in $$props) $$invalidate(2, host = $$props.host);
    		if ('node' in $$props) $$invalidate(3, node = $$props.node);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		contracts,
    		protocol,
    		host,
    		node,
    		addContracts,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world',
            count: 0
        }
    });

    return app;

})(undefined, undefined);
//# sourceMappingURL=bundle.js.map
