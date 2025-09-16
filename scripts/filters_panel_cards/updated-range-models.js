class UpdatedRangeCardModels extends UpdatedRangeCardBase {
    extractRowUpdateDate(rowData) {
        return rowData.updateDate || rowData.updated || null;
    }
}


