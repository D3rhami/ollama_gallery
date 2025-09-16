class UpdatedRangeCardTags extends UpdatedRangeCardBase {
    extractRowUpdateDate(rowData) {
         return rowData.updateDate || rowData.updatedStr || null;
    }
}


