import { nsISupports } from "./nsISupports";

export interface nsIObserver extends nsISupports {
	observe(aSubject: nsISupports, string: undefined, aTopic: undefined, wstring: undefined, aData: undefined): void;
}
