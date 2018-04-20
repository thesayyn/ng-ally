import { NgZone } from "@angular/core";

export function getZone(options?: {enableLongStackTrace?: boolean }): NgZone
{
    return new NgZone(options || {});
}