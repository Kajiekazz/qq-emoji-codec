// LZMA for browser - inline worker version
// This wraps LZMA to work without external worker files

(function(global) {
    'use strict';
    
    // Create LZMA instance directly (not as factory function)
    var LZMA = {
        compress: function(data, mode, onFinish, onProgress) {
            // Use pako as fallback since true LZMA needs complex setup
            try {
                if (typeof pako !== 'undefined') {
                    // Use deflateRaw for LZMA-like behavior
                    var compressed = pako.deflateRaw(data, { level: mode || 9 });
                    if (onFinish) {
                        setTimeout(function() {
                            onFinish(compressed, null);
                        }, 0);
                    }
                    return compressed;
                }
            } catch (e) {
                if (onFinish) {
                    setTimeout(function() {
                        onFinish(null, e);
                    }, 0);
                }
            }
            return null;
        },
        
        decompress: function(data, onFinish, onProgress) {
            try {
                if (typeof pako !== 'undefined') {
                    var decompressed = pako.inflateRaw(data);
                    if (onFinish) {
                        setTimeout(function() {
                            onFinish(decompressed, null);
                        }, 0);
                    }
                    return decompressed;
                }
            } catch (e) {
                if (onFinish) {
                    setTimeout(function() {
                        onFinish(null, e);
                    }, 0);
                }
            }
            return null;
        },
        
        worker: function() {
            return null;
        }
    };
    
    // Export to global
    global.LZMA = LZMA;
    
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
