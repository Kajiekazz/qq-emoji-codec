// 文本编码工具
// 使用特殊字符对作为二进制编码

// 字符定义
const CHAR_ZERO = '\u0014\u01A8';
const CHAR_ONE = '\u0014\u0129';

// 压缩类型标记
const COMPRESS_NONE = '0';
const COMPRESS_BROTLI = '10';
const COMPRESS_LZMA = '11';
const COMPRESS_PAKO = '110';

// 图片路径配置
// 297 = 续标识 (/续标识) = CHAR_ZERO = \u0014\u01A8
// 424 = 拜谢 (/拜谢) = CHAR_ONE = \u0014\u0129
const EMOJI_IMAGES = {
    zero: 'assets/qq_emoji/297/apng/297.png',  // 续标识 - 0
    one: 'assets/qq_emoji/424/apng/424.png'    // 拜谢 - 1
};

// Brotli 模块缓存
let brotliModule = null;

/**
 * 动态加载 Brotli WASM
 */
async function loadBrotli() {
    if (brotliModule) return brotliModule;
    
    try {
        // 动态导入 Brotli 模块
        const brotli = await import('./libs/brotli.js');
        brotliModule = await brotli.default;
        console.log('Brotli 加载成功');
        return brotliModule;
    } catch (e) {
        console.warn('Brotli 加载失败:', e);
        return null;
    }
}

function stringToUtf8Bytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function utf8BytesToString(bytes) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}

function bytesToBinaryString(bytes) {
    return Array.from(bytes)
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join('');
}

function binaryStringToBytes(binaryStr) {
    const bytes = [];
    for (let i = 0; i < binaryStr.length; i += 8) {
        const byte = binaryStr.slice(i, i + 8);
        bytes.push(parseInt(byte, 2));
    }
    return new Uint8Array(bytes);
}

/**
 * Brotli 压缩
 */
async function tryBrotliCompress(data) {
    try {
        const brotli = await loadBrotli();
        if (brotli && brotli.compress) {
            return brotli.compress(data);
        }
    } catch (e) {
        console.warn('Brotli compress error:', e);
    }
    return null;
}

/**
 * Brotli 解压
 */
async function decompressBrotli(data) {
    try {
        const brotli = await loadBrotli();
        if (brotli && brotli.decompress) {
            return brotli.decompress(data);
        }
    } catch (e) {
        console.warn('Brotli decompress error:', e);
    }
    return null;
}

function tryPakoCompress(data) {
    try {
        return pako.deflate(data, { level: 9 });
    } catch (e) {
        console.error('pako compress error:', e);
        return null;
    }
}

function decompressPako(data) {
    try {
        return pako.inflate(data);
    } catch (e) {
        console.error('pako decompress error:', e);
        return null;
    }
}

function tryLzmaCompress(data) {
    return new Promise((resolve) => {
        try {
            if (typeof LZMA !== 'undefined') {
                LZMA.compress(data, 9, (result, error) => {
                    if (error) {
                        console.error('lzma compress error:', error);
                        resolve(null);
                    } else {
                        resolve(new Uint8Array(result));
                    }
                });
            } else {
                resolve(null);
            }
        } catch (e) {
            console.error('lzma compress error:', e);
            resolve(null);
        }
    });
}

function decompressLzma(data) {
    return new Promise((resolve) => {
        try {
            if (typeof LZMA !== 'undefined') {
                LZMA.decompress(data, (result, error) => {
                    if (error) {
                        console.error('lzma decompress error:', error);
                        resolve(null);
                    } else {
                        resolve(new Uint8Array(result));
                    }
                });
            } else {
                resolve(null);
            }
        } catch (e) {
            console.error('lzma decompress error:', e);
            resolve(null);
        }
    });
}

async function selectBestCompression(utf8Data) {
    const originalLength = utf8Data.length;

    // 并行尝试所有压缩方式
    const [brotliCompressed, lzmaCompressed, pakoCompressed] = await Promise.all([
        tryBrotliCompress(utf8Data),
        tryLzmaCompress(utf8Data),
        tryPakoCompress(utf8Data)
    ]);

    const brotliLength = brotliCompressed ? brotliCompressed.length : Infinity;
    const lzmaLength = lzmaCompressed ? lzmaCompressed.length : Infinity;
    const pakoLength = pakoCompressed ? pakoCompressed.length : Infinity;

    const minLength = Math.min(brotliLength, lzmaLength, pakoLength, originalLength);

    if (minLength === brotliLength) {
        return { type: COMPRESS_BROTLI, data: brotliCompressed, originalLength, compressedLength: brotliLength };
    } else if (minLength === lzmaLength) {
        return { type: COMPRESS_LZMA, data: lzmaCompressed, originalLength, compressedLength: lzmaLength };
    } else if (minLength === pakoLength) {
        return { type: COMPRESS_PAKO, data: pakoCompressed, originalLength, compressedLength: pakoLength };
    } else {
        return { type: COMPRESS_NONE, data: utf8Data, originalLength, compressedLength: originalLength };
    }
}

function binaryToEmoji(binaryStr) {
    return binaryStr.split('').map(bit => {
        return bit === '0' ? CHAR_ZERO : CHAR_ONE;
    }).join('');
}

function emojiToBinary(emojiStr) {
    let binary = '';
    let i = 0;
    while (i < emojiStr.length - 1) {
        const pair = emojiStr.slice(i, i + 2);
        if (pair === CHAR_ZERO) {
            binary += '0';
            i += 2;
        } else if (pair === CHAR_ONE) {
            binary += '1';
            i += 2;
        } else {
            // 跳过无法识别的字符（包括零宽字符、换行等）
            const char = emojiStr[i];
            const code = char.charCodeAt(0);
            // 跳过控制字符和零宽字符
            if (code < 32 || code === 0x200B || code === 0xFEFF) {
                i++;
            } else {
                // 可能是半个字符对，尝试跳过
                i++;
            }
        }
    }
    return binary;
}

function renderEmojiToHtml(emojiStr) {
    let html = '';
    let i = 0;
    while (i < emojiStr.length - 1) {
        const pair = emojiStr.slice(i, i + 2);
        const isZero = pair === CHAR_ZERO;
        const isOne = pair === CHAR_ONE;

        if (isZero || isOne) {
            const imgSrc = isZero ? EMOJI_IMAGES.zero : EMOJI_IMAGES.one;
            html += `<span class="emoji-wrapper"><img src="${imgSrc}" draggable="false"></span>`;
            i += 2;
        } else {
            // 跳过无法识别的字符
            i++;
        }
    }
    return html;
}

async function encrypt(text) {
    if (!text) return null;

    const utf8Data = stringToUtf8Bytes(text);
    const compression = await selectBestCompression(utf8Data);

    const headerBinary = compression.type;
    const dataBinary = bytesToBinaryString(compression.data);
    const fullBinary = headerBinary + dataBinary;

    const emojiStr = binaryToEmoji(fullBinary);
    
    let compressionName;
    switch (compression.type) {
        case COMPRESS_NONE: compressionName = '无压缩'; break;
        case COMPRESS_BROTLI: compressionName = 'Brotli'; break;
        case COMPRESS_LZMA: compressionName = 'LZMA'; break;
        case COMPRESS_PAKO: compressionName = 'Deflate'; break;
        default: compressionName = '未知';
    }
    
    return {
        emojiStr,
        compression: compressionName,
        originalLength: compression.originalLength,
        compressedLength: compression.compressedLength,
        emojiCount: emojiStr.length / 2
    };
}

async function decrypt(emojiStr) {
    if (!emojiStr) return null;

    const binaryStr = emojiToBinary(emojiStr);

    if (binaryStr.length < 1) {
        throw new Error('无效的编码内容');
    }

    let header = '';
    let dataStart = 0;

    // 注意顺序：先检查长的头部
    if (binaryStr.slice(0, 3) === COMPRESS_PAKO) {
        header = COMPRESS_PAKO;
        dataStart = 3;
    } else if (binaryStr.slice(0, 2) === COMPRESS_BROTLI) {
        header = COMPRESS_BROTLI;
        dataStart = 2;
    } else if (binaryStr.slice(0, 2) === COMPRESS_LZMA) {
        header = COMPRESS_LZMA;
        dataStart = 2;
    } else if (binaryStr[0] === '0') {
        header = COMPRESS_NONE;
        dataStart = 1;
    } else {
        throw new Error('未知的压缩格式');
    }
    
    const dataBinary = binaryStr.slice(dataStart);
    const compressedData = binaryStringToBytes(dataBinary);
    
    let utf8Data;
    if (header === COMPRESS_NONE) {
        utf8Data = compressedData;
    } else if (header === COMPRESS_BROTLI) {
        utf8Data = await decompressBrotli(compressedData);
    } else if (header === COMPRESS_LZMA) {
        utf8Data = await decompressLzma(compressedData);
    } else if (header === COMPRESS_PAKO) {
        utf8Data = decompressPako(compressedData);
    }
    
    if (!utf8Data) {
        throw new Error('解压失败');
    }
    
    const result = utf8BytesToString(utf8Data);
    
    let compressionName;
    switch (header) {
        case COMPRESS_NONE: compressionName = '无压缩'; break;
        case COMPRESS_BROTLI: compressionName = 'Brotli'; break;
        case COMPRESS_LZMA: compressionName = 'LZMA'; break;
        case COMPRESS_PAKO: compressionName = 'Deflate'; break;
        default: compressionName = '未知';
    }
    
    return {
        text: result,
        compression: compressionName
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // 主题切换
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    const body = document.body;

    function updateThemeIcon(isDark) {
        if (isDark) {
            themeIconSun.style.display = 'block';
            themeIconMoon.style.display = 'none';
        } else {
            themeIconSun.style.display = 'none';
            themeIconMoon.style.display = 'block';
        }
    }

    // 从 localStorage 读取主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.removeAttribute('data-theme');
            updateThemeIcon(false);
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            updateThemeIcon(true);
            localStorage.setItem('theme', 'dark');
        }
    });
    
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${targetTab}-panel`).classList.add('active');
        });
    });
    
    const encryptBtn = document.getElementById('encrypt-btn');
    const encryptInput = document.getElementById('encrypt-input');
    const encryptResult = document.getElementById('encrypt-result');
    const encryptStats = document.getElementById('encrypt-stats');
    
    encryptBtn.addEventListener('click', async () => {
        const text = encryptInput.value;
        if (!text.trim()) {
            alert('请输入要编码的内容');
            return;
        }
        
        try {
            const result = await encrypt(text);
            if (result) {
                encryptResult.dataset.emojiText = result.emojiStr;
                encryptResult.innerHTML = renderEmojiToHtml(result.emojiStr);
                
                encryptStats.innerHTML = `
                    <span>压缩: ${result.compression}</span>
                    <span>原始: ${result.originalLength}B</span>
                    <span>压缩后: ${result.compressedLength}B</span>
                    <span>字符数: ${result.emojiCount}</span>
                `;
            }
        } catch (e) {
            alert('编码失败: ' + e.message);
            console.error(e);
        }
    });
    
    const decryptBtn = document.getElementById('decrypt-btn');
    const decryptInput = document.getElementById('decrypt-input');
    const decryptInputContainer = document.getElementById('decrypt-input-container');
    const decryptResult = document.getElementById('decrypt-result');
    
    decryptInputContainer.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        decryptInput.value = text;
        const html = renderEmojiToHtml(text);
        decryptInputContainer.innerHTML = html;
    });
    
    decryptInputContainer.addEventListener('input', () => {
        const text = decryptInputContainer.innerText || '';
        decryptInput.value = text;
    });
    
    decryptBtn.addEventListener('click', async () => {
        const text = decryptInput.value || decryptInputContainer.innerText || '';
        if (!text.trim()) {
            alert('请输入要解码的内容');
            return;
        }
        
        try {
            const result = await decrypt(text);
            if (result) {
                decryptResult.textContent = result.text;
            }
        } catch (e) {
            alert('解码失败: ' + e.message);
            console.error(e);
        }
    });
    
    document.getElementById('clear-encrypt-btn').addEventListener('click', () => {
        encryptInput.value = '';
        encryptResult.innerHTML = '';
        encryptStats.innerHTML = '';
        delete encryptResult.dataset.emojiText;
    });
    
    document.getElementById('clear-decrypt-btn').addEventListener('click', () => {
        decryptInput.value = '';
        decryptInputContainer.innerHTML = '';
        decryptResult.textContent = '';
    });
    
    encryptResult.addEventListener('click', async () => {
        const emojiText = encryptResult.dataset.emojiText;
        if (!emojiText) return;

        try {
            // 使用 UTF-8 编码的 Blob
            const blob = new Blob([emojiText], { type: 'text/plain;charset=utf-8' });
            const item = new ClipboardItem({ 'text/plain': blob });
            await navigator.clipboard.write([item]);
            encryptResult.style.background = '#e8e8e8';
            setTimeout(() => {
                encryptResult.style.background = '';
            }, 200);
        } catch (e) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = emojiText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.setAttribute('readonly', '');
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            encryptResult.style.background = '#e8e8e8';
            setTimeout(() => {
                encryptResult.style.background = '';
            }, 200);
        }
    });

});
