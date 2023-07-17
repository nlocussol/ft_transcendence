import { EventEmitter } from "@angular/core";

export class Emitters {
    static authEmitter = new EventEmitter<boolean>();
    static privateGame = new EventEmitter<boolean>();
}