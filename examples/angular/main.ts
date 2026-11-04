import "@angular/compiler";
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { GameComponent } from "./game.component";

void bootstrapApplication(GameComponent, { providers: [provideZonelessChangeDetection()] });
