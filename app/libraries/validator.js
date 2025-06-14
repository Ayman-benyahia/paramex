class Validator {

    static isDefined(value) {
        return value !== undefined || value !== null;
    }

    static isString(value) {
        return typeof value === 'string';
    }

    static isBoolean(value) {
        if(typeof value === 'boolean') return true;
        if([0, 1, '0', '1', 'false', 'true', 'FALSE', 'TRUE'].includes(value)) return true;
        return false;
    }

    static isInteger(value, signed) {
        if(typeof signed !== 'boolean') {
            throw new Error('Signed argument must be type of boolean.');
        }

        if(typeof value === 'string') {
            return signed ? /^[+-]?\d+$/.test(value) : /^\+?\d+$/.test(value);
        }
        else if(typeof value === 'number' && Number.isInteger(value)) {
            return signed ? true : value >= 0;
        }

        return false;
    }

    static isDecimal(value, signed) {
        if(typeof signed !== 'boolean') {
            throw new Error('Signed argument must be type of boolean.');
        }

        if(typeof value === 'string') {
            return signed ? /^[+-]?\d+\.\d+$/.test(value) : /^\+?\d+\.\d+$/.test(value);
        }
        else if (typeof value === 'number' && !Number.isInteger(value)) {
            return signed ? true : value >= 0;
        }

        return false;
    }

    static isNumber(value, signed) {
        if(typeof signed !== 'boolean') {
            throw new Error('Signed argument must be type of boolean.');
        }

        if(typeof value === 'string') {
            return signed ? /^[+-]?\d+(\.\d+)?$/.test(value) : /^\+?\d+(\.\d+)?$/.test(value);
        }
        else if(typeof value === 'number' && isFinite(value)) {
            return signed ? true : value >= 0;
        }

        return false;
    }

    static isAlphanum(value) {
        if(typeof value !== 'string') return false;
        return /^[a-zA-Z0-9]+$/.test(value);
    }

    static isArray(value) {
        return Array.isArray(value);
    }

    static isObject(value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    static isFunction(value) {
        return typeof value === 'function';
    }

    static isDomElement(value) {
        return value instanceof Element;
    }

    static isPromise(value) {
        return !!value && typeof value.then === 'function' && typeof value.catch === 'function' && value.constructor.name === 'Promise';
    }

    static isURL(value, options) {
        let genDelims = `[:\\/\\?\\#\\[\\]\\@]`;
        let subDelims = `[\\*\\+,;=]`;
        let reserved = `(${genDelims}|${subDelims})`;
        let unreserved = `([a-zA-Z0-9\\-\\.\\_\\~])`;
        let pctEncoded = `%[0-9a-fA-F]{2}`;
    
        let pchar = `(${unreserved}|${pctEncoded}|${subDelims}|[:@])`;
        let fragment = `(${pchar}|[\\/\\?])*`;
        let query = `(${pchar}|[\\/\\?])*`;
    
        let segmentNZNC = `(${unreserved}|${pctEncoded}|${subDelims}|@)+`;
        let segmentNZ = `${pchar}+`;
        let segment = `${pchar}*`;
    
        let pathEmpty = ``;
        let pathRootless = `${segmentNZ}(\\/${segment})*`;
        let pathNoscheme = `${segmentNZNC}(\\/${segment})*`;
        let pathAbsolute = `\\/((${segmentNZ}(\\/${segment})*)?)`;
        let pathAbempty = `(\\/${segment})*`;
        let path = `(${pathAbempty}|${pathAbsolute}|${pathNoscheme}|${pathRootless}|${pathEmpty})`;
    
        let regName = `(${unreserved}|${pctEncoded}|${subDelims})*`;
        let decOctet = `([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])`;
        let ipv4Adress = `${decOctet}\\.${decOctet}\\.${decOctet}\\.${decOctet}`;
        let h16 = `[0-9a-fA-F]{1,4}`;
        let ls32 = `((${h16}:${h16})|${ipv4Adress})`;
    
        let ipv6Address = `(
            (${h16}:){6}${ls32} |
            ::((${h16}:){5}${ls32})? |
            (${h16})?::(${h16}:){4}${ls32} |
            ((${h16}:){0,1}${h16})?::(${h16}:){3}${ls32} |
            ((${h16}:){0,2}${h16})?::(${h16}:){2}${ls32} |
            ((${h16}:){0,3}${h16})?::${h16}:${ls32} |
            ((${h16}:){0,4}${h16})?::${ls32} |        
            ((${h16}:){0,5}${h16})?::${h16} |
            ((${h16}:){0,6}${h16})?::
        )`.replace(/\s+/g, ''); // Remove unnecessary whitespace
    
        let ipvFuture = `v[0-9a-fA-F]+\\.(${unreserved}|${subDelims}|:)+`;
        let ipLiteral = `\\[(${ipv6Address}|${ipvFuture})\\]`;
        let port = `[0-9]*`;
        let host = `(${ipLiteral}|${ipv4Adress}|${regName})`;
        let userInfo = `(${unreserved}|${pctEncoded}|${subDelims}|:)*`;
        let authority = `(${userInfo}@)?${host}(:${port})?`;
        let scheme = `[a-zA-Z]([a-zA-Z0-9\\+\\-\\.]*)`;
    
        let relativePart = `(\\/\\/${authority}${pathAbempty}|${pathAbsolute}|${pathNoscheme}|${pathEmpty})`;
        let hierPart = `(\\/\\/${authority}${pathAbempty}|${pathAbsolute}|${pathRootless}|${pathEmpty})`;
        let relativeRef = `${relativePart}(\\?${query})?(#${fragment})?`;
        let absoluteUri = `${scheme}:${hierPart}(\\?${query})?`;
        let uri = `${scheme}:${hierPart}(\\?${query})?(#${fragment})?`;
        let uriReference = `(${uri}|${relativeRef})`;
    
        let isPath         = new RegExp('^' + path         + '$', 'g').test(value);
        let isRelativeRef  = new RegExp('^' + relativeRef  + '$', 'g').test(value);
        let isAbsoluteUri  = new RegExp('^' + absoluteUri  + '$', 'g').test(value);
        let isUriReference = new RegExp('^' + uriReference + '$', 'g').test(value);
        return isUriReference;
    }

    static isTel(value, format) {
        if (!this.isString(format)) { 
            throw new Error('Format argument must be a string'); 
        }

        if (!this.isString(value)) { 
            return false;
        }

        format = (format.length >= 0) ? format : 'SSSSSSSSSS'; // syntax ->  + C{1,3} N{1,5} S{1,10} alphanum E{1,5}    
        let FORMAT_REGEX = /^((\+)?([^a-zA-Z0-9]*)(C{0,3}))?([^a-zA-Z0-9]*)(N{0,5})?([^a-zA-Z0-9]*)(S{1,10})([^a-zA-Z0-9]*)(([a-z]|[^a-zA-Z0-9])*(E{1,5}))?$/;
        if (!FORMAT_REGEX.test(format)) throw new Error('Invalid format!');
    
        let pattern = '',
            i = 0;
        while (i < format.length) {
            if (['C', 'N', 'S', 'E'].includes(format[i])) {
                const placeholder = format[i];
                while (i < format.length && format[i] === placeholder) {
                    pattern += `[0-9]`;
                    i++;
                }
            } 
            else if (/[^a-zA-Z0-9]/.test(format[i])) {
                const specialChar = format[i];
                while (i < format.length && format[i] === specialChar) {
                    pattern += `\\${char}`;
                    i++;
                }
            } 
            else {
                pattern += `\\${format[i]}`;
                i++;
            }
        }
    
        return new RegExp('^' + pattern + '$').test(value);
    }

    static isDate(value, format) {
        if(value instanceof Date) {
            return !isNaN(value.getTime());
        }

        if(!this.isString(format)) { 
            throw new Error('Format argument must be a string.'); 
        }

        if(!this.toString(value)) { 
            return false; 
        }

        format = (format.length > 0) ? format : 'DD/MM/YYYY'; 
        const FORMAT_REGEX = /^((D{1,2}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?Y{1,})|(D{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?M{1,2})|(M{1,2}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?Y{1,})|(M{1,2}[^0-9a-zA-Z]?Y{1,}[^0-9a-zA-Z]?D{1,2})|(Y{1,}[^0-9a-zA-Z]?D{1,2}[^0-9a-zA-Z]?M{1,2})|(Y{1,}[^0-9a-zA-Z]?M{1,2}[^0-9a-zA-Z]?D{1,2}))$/;
        if (!FORMAT_REGEX.test(format)) throw new Error('Invalid Format!');
    
        let pattern = '',
            i = 0;
        while (i < format.length) {
            if (format[i] === 'D') {
                let count = 0;
                while (format[i] === 'D') { count++; i++; }
                pattern += count === 1 ? '([1-9])' : '(0[1-9]|[1-2][0-9]|3[0-1])';
                continue;
            }

            if (format[i] === 'M') {
                let count = 0;
                while (format[i] === 'M') { count++; i++; }
                pattern += count === 1 ? '([1-9])' : '(0[1-9]|1[0-2])';
                continue;
            }

            if (format[i] === 'Y') {
                let count = 0;
                while (format[i] === 'Y') { count++; i++; }
                if (count === 2) pattern += '([0-9]{2})';
                else if (count === 4) pattern += '([0-9]{4})';
                else throw new Error('Year must be YY or YYYY.');
                continue;
            }

            if (/[^0-9a-zA-Z]/.test(format[i])) pattern += '\\' + format[i];
            else throw new Error('Invalid character in format.');

            i++;
        }

        return new RegExp('^' + pattern + '$', 'g').test(value);
    }

    static isEmpty(value) {
        if (this.isArray(value)  || this.isString(value)) return value.length              === 0;
        if (value instanceof Map || value instanceof Set) return value.size                === 0;
        if (this.isObject(value))                         return Object.keys(value).length === 0;
        return value === null    || value === undefined;
    }

    static isAtMost(value, length) {
        if(!this.isInteger(length)) {
            throw new Error('Length argument must be an integer');
        }

        if(this.isInteger(value))                        return parseInt(value, 10) <= length;
        if(this.isFloat(value))                          return parseFloat(value, 10) <= length;
        if(this.isArray(value)  || this.isString(value)) return value.length <= length;
        if(this.isObject(value))                         return Object.keys(value).length <= length;
        if(value instanceof Map || value instanceof Set) return value.size <= length;
        return false;
    }

    static isAtLeast(value, length) {
        if(!this.isInteger(length)) {
            throw new Error('Length argument must be an integer');
        }
        
        if(this.isInteger(value))                        return parseInt(value, 10) >= length;
        if(this.isFloat(value))                          return parseFloat(value, 10) >= length;
        if(this.isArray(value)  || this.isString(value)) return value.length >= length;
        if(this.isObject(value))                         return Object.keys(value).length >= length;
        if(value instanceof Map || value instanceof Set) return value.size >= length;
        return false;
    }

    static inRange(value, min, max) {
        if(!this.isInteger(min)) {
            throw new Error('Min argument must be an integer');
        }

        if(!this.isInteger(max)) {
            throw new Error('Max argument must be a positive integer');
        }

        if(min >= max) {
            throw new Error('Min argument must not value must not exceed Max argument value');
        }

        if(this.isArray(value) || this.isString(value)) {
            return value.length >= min && value.length <= max;
        }
        if(this.isInteger(value)) {
            value = parseInt(value, 10);
            return value >= min && value <= max;
        }
        if(this.isFloat(value)) {
            value = parseFloat(value, 10);
            return value >= min && value <= max;
        }
        if(this.isObject(value)) {
            let keys = Object.keys(value);
            return keys.length >= min && keys.length <= max;
        }
        if(value instanceof Map || value instanceof Set) {
            return value.size >= min && value.size <= max;
        }
        return false;
    }

    static isEmail(value) {
        if(!this.isString(value)) return false;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    }

    static isPassword(value, minLen, maxLen) {
        if(!this.isInteger(minLen)) throw new Error('Max length argument must be an integer.');
        if(!this.isInteger(maxLen)) throw new Error('Min length argument must be an integer.');
        if(minLen >= maxLen)        throw new Error('Min length must be smaller than Max length');

        if(!this.isString(value)) { 
            return false; 
        }

        return /[0-9]+/g.test(value)          && 
               /[a-z]+/g.test(value)          && 
               /[A-Z]+/g.test(value)          && 
               /[^a-zA-Z0-9\s]+/g.test(value) &&
               value.length >= minLen         &&
               value.length <= maxLen
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Validator;
}