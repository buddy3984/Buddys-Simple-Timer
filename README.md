
# Buddy's Simple Timer

Buddy's Simple Timer is a Node-RED node designed to forward the incoming payload after a specified delay, measured in seconds. It's perfect for scenarios where you need to delay the flow of messages for a certain amount of time.

## Features

- **Timer Reset**: The timer resets and starts counting down again from the specified seconds each time a new payload is received.
- **Status Indication**: Provides a visual status indication showing when the timer is set to trigger next.
- **Persistent Memory**: Maintains the countdown state through Node-RED restarts or redeploys.
- **Immediate Execution**: You can trigger the timer immediately by sending `0` in `msg.timer_seconds`, or stop the timer by sending `"STOP"` in `msg.payload`.

## How to Use

1. Connect this node to the nodes in your flow.
2. Configure the delay by inputting the countdown time in seconds in the node settings.
3. The timer will reset to the countdown with each new incoming payload.
4. To override the duration dynamically, send a numerical value in `msg.timer_seconds`.

## Node Configuration

- **Timer Seconds**: Set the countdown time in seconds. This can also be dynamically set by passing a `msg.timer_seconds` property with a numerical value.

## Inputs

- **msg.timer_seconds**: A numerical value indicating the countdown time in seconds. If provided, this value overrides the static configuration set in the node properties.

## Outputs

- The node outputs the same payload it received, after waiting for the specified time.

## Example Flow

Here's a simple example of how to use Buddy's Simple Timer in a flow:

```json
[{"id":"338d3bc566e658b8","type":"comment","z":"fc864a2d8dd06829","name":"10 second timer","info":"","x":620,"y":300,"wires":[]},{"id":"8ae5fc10d4f542e5","type":"buddys-simple-timer","z":"fc864a2d8dd06829","name":"","timer_seconds":"10","x":600,"y":360,"wires":[["eefd52c4c980ddf9"]]},{"id":"eefd52c4c980ddf9","type":"debug","z":"fc864a2d8dd06829","name":"debug 1","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":800,"y":360,"wires":[]},{"id":"f5b7ab4366c08acd","type":"inject","z":"fc864a2d8dd06829","name":"","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"STOP","payloadType":"str","x":390,"y":400,"wires":[["8ae5fc10d4f542e5"]]},{"id":"0bf6bb98c826c0c3","type":"inject","z":"fc864a2d8dd06829","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"test","payload":"ON","payloadType":"str","x":390,"y":360,"wires":[["8ae5fc10d4f542e5"]]},{"id":"af3151c4a38e9d40","type":"inject","z":"fc864a2d8dd06829","name":"30 seconds","props":[{"p":"payload"},{"p":"msg.timer_seconds","v":"30","vt":"num"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":370,"y":320,"wires":[["8ae5fc10d4f542e5"]]}]
```
