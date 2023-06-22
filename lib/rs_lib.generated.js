// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file
// source-hash: 275f97737e30eb6246d79a5a283ad0e2686fa941
let wasm;

const cachedTextDecoder = typeof TextDecoder !== "undefined"
  ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
  : {
    decode: () => {
      throw Error("TextDecoder not available");
    },
  };

if (typeof TextDecoder !== "undefined") cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

function getObject(idx) {
  return heap[idx];
}

function dropObject(idx) {
  if (idx < 132) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = typeof TextEncoder !== "undefined"
  ? new TextEncoder("utf-8")
  : {
    encode: () => {
      throw Error("TextEncoder not available");
    },
  };

const encodeString = function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
};

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length) >>> 0;
    getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len) >>> 0;

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

const CLOSURE_DTORS = new FinalizationRegistry((state) => {
  wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
});

function makeMutClosure(arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor };
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
        CLOSURE_DTORS.unregister(state);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;
  CLOSURE_DTORS.register(real, state, state);
  return real;
}
function __wbg_adapter_26(arg0, arg1, arg2) {
  wasm
    ._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hefababf31fa0ef37(
      arg0,
      arg1,
      addHeapObject(arg2),
    );
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
function __wbg_adapter_118(arg0, arg1, arg2, arg3) {
  wasm.wasm_bindgen__convert__closures__invoke2_mut__hb5ce4304b99bb0cc(
    arg0,
    arg1,
    addHeapObject(arg2),
    addHeapObject(arg3),
  );
}

const AppFinalization = new FinalizationRegistry((ptr) =>
  wasm.__wbg_app_free(ptr >>> 0)
);
/** */
export class App {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(App.prototype);
    obj.__wbg_ptr = ptr;
    AppFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AppFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_app_free(ptr);
  }
  /**
   * @param {string} endpoint
   * @param {string} host_rewrite
   * @param {string} name
   * @param {string} region
   * @param {string} key
   * @param {string} secret
   * @returns {App}
   */
  static new(endpoint, host_rewrite, name, region, key, secret) {
    const ptr0 = passStringToWasm0(
      endpoint,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      host_rewrite,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(
      region,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len3 = WASM_VECTOR_LEN;
    const ptr4 = passStringToWasm0(
      key,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len4 = WASM_VECTOR_LEN;
    const ptr5 = passStringToWasm0(
      secret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len5 = WASM_VECTOR_LEN;
    const ret = wasm.app_new(
      ptr0,
      len0,
      ptr1,
      len1,
      ptr2,
      len2,
      ptr3,
      len3,
      ptr4,
      len4,
      ptr5,
      len5,
    );
    return App.__wrap(ret);
  }
  /**
   * @param {string} url
   * @param {number} width
   * @param {number} height
   * @returns {Promise<Uint8Array>}
   */
  handler(url, width, height) {
    const ptr0 = passStringToWasm0(
      url,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.app_handler(this.__wbg_ptr, ptr0, len0, width, height);
    return takeObject(ret);
  }
  /**
   * @returns {Promise<Array<any>>}
   */
  list() {
    const ret = wasm.app_list(this.__wbg_ptr);
    return takeObject(ret);
  }
}

const imports = {
  __wbindgen_placeholder__: {
    __wbindgen_string_new: function (arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return addHeapObject(ret);
    },
    __wbindgen_cb_drop: function (arg0) {
      const obj = takeObject(arg0).original;
      if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
      }
      const ret = false;
      return ret;
    },
    __wbindgen_object_drop_ref: function (arg0) {
      takeObject(arg0);
    },
    __wbindgen_string_get: function (arg0, arg1) {
      const obj = getObject(arg1);
      const ret = typeof (obj) === "string" ? obj : undefined;
      var ptr1 = isLikeNone(ret)
        ? 0
        : passStringToWasm0(
          ret,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
      var len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    },
    __wbg_new_abda76e883ba8a5f: function () {
      const ret = new Error();
      return addHeapObject(ret);
    },
    __wbg_stack_658279fe44541cf6: function (arg0, arg1) {
      const ret = getObject(arg1).stack;
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    },
    __wbg_error_f851667af71bcfc6: function (arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1);
      }
    },
    __wbindgen_object_clone_ref: function (arg0) {
      const ret = getObject(arg0);
      return addHeapObject(ret);
    },
    __wbindgen_number_new: function (arg0) {
      const ret = arg0;
      return addHeapObject(ret);
    },
    __wbg_fetch_57429b87be3dcc33: function (arg0) {
      const ret = fetch(getObject(arg0));
      return addHeapObject(ret);
    },
    __wbg_instanceof_Window_c5579e140698a9dc: function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Window;
      } catch {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_performance_01a75a1b70b2c191: function (arg0) {
      const ret = getObject(arg0).performance;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    },
    __wbg_now_c97f243e7947c4ac: function (arg0) {
      const ret = getObject(arg0).now();
      return ret;
    },
    __wbg_newwithstrandinit_a4cd16dfaafcf625: function () {
      return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(
          getStringFromWasm0(arg0, arg1),
          getObject(arg2),
        );
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_instanceof_Response_7ade9a5a066d1a55: function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Response;
      } catch {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_url_59cb32ef6a837521: function (arg0, arg1) {
      const ret = getObject(arg1).url;
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    },
    __wbg_status_d2b2d0889f7e970f: function (arg0) {
      const ret = getObject(arg0).status;
      return ret;
    },
    __wbg_headers_2de03c88f895093b: function (arg0) {
      const ret = getObject(arg0).headers;
      return addHeapObject(ret);
    },
    __wbg_newwithoptstrandinit_ff70839f3334d3aa: function () {
      return handleError(function (arg0, arg1, arg2) {
        const ret = new Response(
          arg0 === 0 ? undefined : getStringFromWasm0(arg0, arg1),
          getObject(arg2),
        );
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_arrayBuffer_2693673868da65b7: function () {
      return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_text_65fa1887e8f7b4ac: function () {
      return handleError(function (arg0) {
        const ret = getObject(arg0).text();
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_fetch_621998933558ad27: function (arg0, arg1) {
      const ret = getObject(arg0).fetch(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_debug_e3f6a1578e6d45ca: function (arg0) {
      console.debug(getObject(arg0));
    },
    __wbg_error_a7e23606158b68b9: function (arg0) {
      console.error(getObject(arg0));
    },
    __wbg_info_05db236d79f1b785: function (arg0) {
      console.info(getObject(arg0));
    },
    __wbg_log_dc06ec929fc95a20: function (arg0) {
      console.log(getObject(arg0));
    },
    __wbg_warn_9bdd743e9f5fe1e0: function (arg0) {
      console.warn(getObject(arg0));
    },
    __wbg_signal_bcb55e86063f8860: function (arg0) {
      const ret = getObject(arg0).signal;
      return addHeapObject(ret);
    },
    __wbg_new_668956ac1089f8cf: function () {
      return handleError(function () {
        const ret = new AbortController();
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_abort_de75e4ab5136bcee: function (arg0) {
      getObject(arg0).abort();
    },
    __wbg_new_143b41b4342650bb: function () {
      return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_append_fac652007989b765: function () {
      return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(
          getStringFromWasm0(arg1, arg2),
          getStringFromWasm0(arg3, arg4),
        );
      }, arguments);
    },
    __wbg_set_76353df4722f4954: function () {
      return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).set(
          getStringFromWasm0(arg1, arg2),
          getStringFromWasm0(arg3, arg4),
        );
      }, arguments);
    },
    __wbg_new_0394642eae39db16: function () {
      const ret = new Array();
      return addHeapObject(ret);
    },
    __wbindgen_is_function: function (arg0) {
      const ret = typeof (getObject(arg0)) === "function";
      return ret;
    },
    __wbg_newnoargs_c9e6043b8ad84109: function (arg0, arg1) {
      const ret = new Function(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    },
    __wbindgen_is_object: function (arg0) {
      const val = getObject(arg0);
      const ret = typeof (val) === "object" && val !== null;
      return ret;
    },
    __wbg_next_f4bc0e96ea67da68: function (arg0) {
      const ret = getObject(arg0).next;
      return addHeapObject(ret);
    },
    __wbg_next_ec061e48a0e72a96: function () {
      return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_done_b6abb27d42b63867: function (arg0) {
      const ret = getObject(arg0).done;
      return ret;
    },
    __wbg_value_2f4ef2036bfad28e: function (arg0) {
      const ret = getObject(arg0).value;
      return addHeapObject(ret);
    },
    __wbg_iterator_7c7e58f62eb84700: function () {
      const ret = Symbol.iterator;
      return addHeapObject(ret);
    },
    __wbg_get_f53c921291c381bd: function () {
      return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_call_557a2f2deacc4912: function () {
      return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_new_2b6fea4ea03b1b95: function () {
      const ret = new Object();
      return addHeapObject(ret);
    },
    __wbg_self_742dd6eab3e9211e: function () {
      return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_window_c409e731db53a0e2: function () {
      return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_globalThis_b70c095388441f2d: function () {
      return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_global_1c72617491ed7194: function () {
      return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
      }, arguments);
    },
    __wbindgen_is_undefined: function (arg0) {
      const ret = getObject(arg0) === undefined;
      return ret;
    },
    __wbg_push_109cfc26d02582dd: function (arg0, arg1) {
      const ret = getObject(arg0).push(getObject(arg1));
      return ret;
    },
    __wbg_instanceof_Error_fac23a8832b241da: function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Error;
      } catch {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_message_eab7d45ec69a2135: function (arg0) {
      const ret = getObject(arg0).message;
      return addHeapObject(ret);
    },
    __wbg_name_8e6176d4db1a502d: function (arg0) {
      const ret = getObject(arg0).name;
      return addHeapObject(ret);
    },
    __wbg_toString_506566b763774a16: function (arg0) {
      const ret = getObject(arg0).toString();
      return addHeapObject(ret);
    },
    __wbg_call_587b30eea3e09332: function () {
      return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_getTime_40bd09e020e8bc8c: function (arg0) {
      const ret = getObject(arg0).getTime();
      return ret;
    },
    __wbg_new0_494c19a27871d56f: function () {
      const ret = new Date();
      return addHeapObject(ret);
    },
    __wbg_new_2b55e405e4af4986: function (arg0, arg1) {
      try {
        var state0 = { a: arg0, b: arg1 };
        var cb0 = (arg0, arg1) => {
          const a = state0.a;
          state0.a = 0;
          try {
            return __wbg_adapter_118(a, state0.b, arg0, arg1);
          } finally {
            state0.a = a;
          }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
      } finally {
        state0.a = state0.b = 0;
      }
    },
    __wbg_resolve_ae38ad63c43ff98b: function (arg0) {
      const ret = Promise.resolve(getObject(arg0));
      return addHeapObject(ret);
    },
    __wbg_then_8df675b8bb5d5e3c: function (arg0, arg1) {
      const ret = getObject(arg0).then(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_then_835b073a479138e5: function (arg0, arg1, arg2) {
      const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    },
    __wbg_buffer_55ba7a6b1b92e2ac: function (arg0) {
      const ret = getObject(arg0).buffer;
      return addHeapObject(ret);
    },
    __wbg_newwithbyteoffsetandlength_88d1d8be5df94b9b: function (
      arg0,
      arg1,
      arg2,
    ) {
      const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    },
    __wbg_new_09938a7d020f049b: function (arg0) {
      const ret = new Uint8Array(getObject(arg0));
      return addHeapObject(ret);
    },
    __wbg_set_3698e3ca519b3c3c: function (arg0, arg1, arg2) {
      getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    },
    __wbg_length_0aab7ffd65ad19ed: function (arg0) {
      const ret = getObject(arg0).length;
      return ret;
    },
    __wbg_newwithlength_89eeca401d8918c2: function (arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return addHeapObject(ret);
    },
    __wbg_has_40b8c976775c8ead: function () {
      return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
      }, arguments);
    },
    __wbg_set_07da13cc24b69217: function () {
      return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(
          getObject(arg0),
          getObject(arg1),
          getObject(arg2),
        );
        return ret;
      }, arguments);
    },
    __wbg_stringify_d06ad2addc54d51e: function () {
      return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbindgen_debug_string: function (arg0, arg1) {
      const ret = debugString(getObject(arg1));
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    },
    __wbindgen_throw: function (arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbindgen_memory: function () {
      const ret = wasm.memory;
      return addHeapObject(ret);
    },
    __wbindgen_closure_wrapper2755: function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 941, __wbg_adapter_26);
      return addHeapObject(ret);
    },
  },
};

import { Loader } from "https://deno.land/x/wasmbuild@0.14.1/loader.ts";
import { cacheToLocalDir } from "https://deno.land/x/wasmbuild@0.14.1/cache.ts";

const loader = new Loader({
  imports,
  cache: cacheToLocalDir,
});
/**
 * Decompression callback
 *
 * @callback DecompressCallback
 * @param {Uint8Array} compressed
 * @return {Uint8Array} decompressed
 */

/**
 * Options for instantiating a Wasm instance.
 * @typedef {Object} InstantiateOptions
 * @property {URL=} url - Optional url to the Wasm file to instantiate.
 * @property {DecompressCallback=} decompress - Callback to decompress the
 * raw Wasm file bytes before instantiating.
 */

/** Instantiates an instance of the Wasm module returning its functions.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {InstantiateOptions=} opts
 */
export async function instantiate(opts) {
  return (await instantiateWithInstance(opts)).exports;
}

/** Instantiates an instance of the Wasm module along with its exports.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {InstantiateOptions=} opts
 * @returns {Promise<{
 *   instance: WebAssembly.Instance;
 *   exports: { App : typeof App  }
 * }>}
 */
export async function instantiateWithInstance(opts) {
  const { instance } = await loader.load(
    opts?.url ?? new URL("rs_lib_bg.wasm", import.meta.url),
    opts?.decompress,
  );
  wasm = wasm ?? instance.exports;
  cachedInt32Memory0 = cachedInt32Memory0 ?? new Int32Array(wasm.memory.buffer);
  cachedUint8Memory0 = cachedUint8Memory0 ?? new Uint8Array(wasm.memory.buffer);
  return {
    instance,
    exports: getWasmInstanceExports(),
  };
}

function getWasmInstanceExports() {
  return { App };
}

/** Gets if the Wasm module has been instantiated. */
export function isInstantiated() {
  return loader.instance != null;
}
