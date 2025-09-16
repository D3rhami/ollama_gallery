class LoadingWrapper {
    static async retry(loadFunction, maxAttempts = 3, delay = 2000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const result = await loadFunction();
                if (result !== false) {
                    return result;
                }
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt} failed:`, error.message);
            }
            
            if (attempt < maxAttempts) {
                console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new Error(`All ${maxAttempts} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    
    static waitForDataTable(tableName, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkDataTable = () => {
                const dataTable = tableName === 'models' ? window.dataTable : window.tagsDataTable;
                
                if (dataTable && dataTable.data) {
                    resolve(dataTable);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`DataTable ${tableName} not available after ${timeout}ms`));
                } else {
                    setTimeout(checkDataTable, 100);
                }
            };
            
            checkDataTable();
        });
    }
}
