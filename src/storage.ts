export interface Person {
    firstName: string,
    lastName: string,
    nationalID?: string,
    birthDate?: string,
    gender: Gender,
    address?: Address
}

export interface Student extends Person {
    father?: Person,
    mother?: Person
}

export interface Address {
    streetName?: string,
    streetNumber?: string
}

export enum Gender {
    Unknown,
    Female,
    Male
}

// Define your storage data here
export interface Storage {
    active: Student
}

export function getStorageData(): Promise<Storage> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            return resolve(result as Storage);
        });
    });
}

export function setStorageData(data: Storage): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(data, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            return resolve();
        });
    });
}

export function getStorageItem<Key extends keyof Storage>(
    key: Key,
): Promise<Storage[Key]> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            return resolve((result as Storage)[key]);
        });
    });
}

export function setStorageItem<Key extends keyof Storage>(
    key: Key,
    value: Storage[Key],
): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({[key]: value}, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }

            return resolve();
        });
    });
}

export async function initializeStorageWithDefaults(defaults: Storage) {
    const currentStorageData = await getStorageData();
    const newStorageData = Object.assign({}, defaults, currentStorageData);
    await setStorageData(newStorageData);
}
