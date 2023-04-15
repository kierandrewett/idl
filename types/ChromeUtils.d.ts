export interface ProfilerMarkerOptions {
	startTime: unknown /* todo: startTime: DOMHighResTimeStamp */;
	captureStack: boolean;
	category: string;
	innerWindowId: number;
}
