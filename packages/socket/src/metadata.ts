const METADATA_KEY = 'NG_ALLY_SOCKET_LISTENER';

export interface OnMetadata {
	[eventName: string]: string[];
}

function getMetadataEntries<T>(sourceProto: T): OnMetadata {
	return sourceProto.constructor.hasOwnProperty(METADATA_KEY) ? (sourceProto.constructor as any)[METADATA_KEY] : {};
}

function setMetadataEntries<T>(sourceProto: T, eventName: string, propertyKey) {
	const constructor = sourceProto.constructor;
	const meta: OnMetadata = constructor.hasOwnProperty(METADATA_KEY)
		? (constructor as any)[METADATA_KEY]
		: Object.defineProperty(constructor, METADATA_KEY, { value: {} })[METADATA_KEY];
	meta[eventName] = new Array(...meta[eventName]).concat(propertyKey);
}

export function On<T>(eventName: string): PropertyDecorator {
	return function<K extends Extract<keyof T, string>>(target: T, propertyName: K) {
		setMetadataEntries<T>(target, eventName, propertyName);
	} as (target: {}, propertyName: string | symbol) => void;
}

export function getSourceForInstance<T>(instance: T): T {
	return Object.getPrototypeOf(instance);
}

export function getOnMetadata<T>(instance: T): OnMetadata {
	return getMetadataEntries(getSourceForInstance(instance));
}

export type OnEventsMetadata<T> = { [key in Extract<keyof T, string>]?: string };
