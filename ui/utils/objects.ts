export function convertKeyValueToList(obj: any) {
    if (!obj){
        return []
    }
    return Object.keys(obj).map(key => ({key: key, value: obj[key]}));
}

export function convertListToKeyValue(list: any[]) {
    return list.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
    }, {});
}
