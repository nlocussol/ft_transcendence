import { EventEmitter } from "@angular/core";

export class Emitters {
    static authEmitter = new EventEmitter<boolean>();
    static privateGameInvit = new EventEmitter<boolean>();
}