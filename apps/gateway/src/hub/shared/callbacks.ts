import type { ServerMessage } from "@proliferate/shared";
import type { RuntimeDaemonEvent } from "../../harness/contracts/coding";

export type DisconnectCallback = (reason: string) => void;

export type BroadcastServerMessageCallback = (message: ServerMessage) => void;

export type RuntimeDaemonEventCallback = (event: RuntimeDaemonEvent) => void;
