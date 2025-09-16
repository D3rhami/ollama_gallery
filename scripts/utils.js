class ParameterUtils {
    static parseParameterSize(paramString) {
        const sizeMap = {
            'k': 1e3,
            'K': 1e3,
            'm': 1e6,
            'M': 1e6,
            'b': 1e9,
            'B': 1e9,
            't': 1e12,
            'T': 1e12,
            'p': 1e15,
            'P': 1e15
        };
        
        const match = paramString.match(/^([0-9.]+)([kKmMbBtTpP])$/);
        if (match) {
            const value = parseFloat(match[1]);
            const suffix = match[2];
            const multiplier = sizeMap[suffix];
            const numericValue = value * multiplier;
            return {
                original: paramString,
                value: numericValue,
                display: `${value}${suffix}`,
                numeric: numericValue
            };
        }
        
        const eMatch = paramString.match(/^e([0-9.]+)([kKmMbBtTpP])$/);
        if (eMatch) {
            const value = parseFloat(eMatch[1]);
            const suffix = eMatch[2];
            const multiplier = sizeMap[suffix];
            const numericValue = value * multiplier;
            return {
                original: paramString,
                value: numericValue,
                display: `e${value}${suffix}`,
                numeric: numericValue
            };
        }
        
        const matrixMatch = paramString.match(/^([0-9.]+)x([0-9.]+)([kKmMbBtTpP])$/);
        if (matrixMatch) {
            const dim1 = parseFloat(matrixMatch[1]);
            const dim2 = parseFloat(matrixMatch[2]);
            const suffix = matrixMatch[3];
            const multiplier = sizeMap[suffix];
            const numericValue = dim1 * dim2 * multiplier;
            return {
                original: paramString,
                value: numericValue,
                display: `${dim1}x${dim2}${suffix}`,
                numeric: numericValue
            };
        }
        
        const numericValue = parseFloat(paramString);
        if (!isNaN(numericValue)) {
            return {
                original: paramString,
                value: numericValue,
                display: paramString,
                numeric: numericValue
            };
        }
        
        return {
            original: paramString,
            value: Number.MAX_SAFE_INTEGER,
            display: paramString,
            numeric: Number.MAX_SAFE_INTEGER
        };
    }
    
    static extractParametersFromString(parameterString) {
        if (!parameterString) return [];
        
        const params = parameterString.split(',').map(p => p.trim()).filter(p => p);
        return params.map(param => this.parseParameterSize(param));
    }
    
    static sortParametersByValue(parameters) {
        return parameters.sort((a, b) => a.numeric - b.numeric);
    }
    
    static groupParametersByType(parameters) {
        const groups = {
            'k': [],
            'M': [],
            'B': [],
            'T': [],
            'P': [],
            'other': []
        };
        
        parameters.forEach(param => {
            const match = param.original.match(/^([0-9.]+)([kKMBTP])$/);
            if (match) {
                const suffix = match[2].toUpperCase();
                if (groups[suffix]) {
                    groups[suffix].push(param);
                }
            } else {
                groups.other.push(param);
            }
        });
        
        Object.keys(groups).forEach(key => {
            groups[key] = this.sortParametersByValue(groups[key]);
        });
        
        return groups;
    }
}
