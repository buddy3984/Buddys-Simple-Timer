module.exports = function(RED) {
    function BuddySumNode(config) {
        RED.nodes.createNode(this, config);
        // Configuration property
        var node = this;
        node.timer_seconds_bruh = config.timer_seconds;
        var node_id = node.id;
        var triggerTime;
        var fs = require('fs');
        const path = require('path');
        var timeoutHandle = null;
        var filename = `config/buddys_node_red_logs/buddys_timer/${node_id}.btf`;
        var file_vars_dude = {filename:filename, timer_seconds_bruh:Number(node.timer_seconds_bruh), node_id:node_id, triggerTime:triggerTime};
        var file_vars_read_bruh = {};

        // // Functions!!!

        // Autostart and read file to resume timer!
        function readAndStartTimer() {
            node.status({fill: "blue", shape: "ring", text: "ready!"});
            // Additional logic to start the timer on deploy if necessary
            fs.readFile(filename, 'utf8', function(err, data) {
                if (err) {
                    node.status({fill:"yellow", shape:"ring", text:"waiting for payload..."});
                    // Send an error message downstream in your flow
                    node.send({error: err});
                    return;
                }
                try {
                    file_vars_dude = JSON.parse(data);
                    buddys_timer();
                } catch (parseErr) {
                    node.status({fill:"red", shape:"dot", text:"failed to parse file data"});
                    node.error("Failed to parse file data: " + parseErr);
                }
            });
        }

        // Function buddys_timer to start that timer!
        function buddys_timer() {
            node.status({fill:"blue", shape:"ring", text:"Scheduled to trigger at " + file_vars_dude.triggerTime});
            // Function to calculate the delay until the trigger time in milliseconds
            function getDelay(input_01) {
                let now = new Date();
                let parts = input_01.split(":");
                let triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));

                // Calculate delay in milliseconds
                return triggerDate.getTime() - now.getTime();
            }
            // Get the delay until the trigger time
            let delay = getDelay(file_vars_dude.triggerTime);
            // Check if the delay is negative, which means the time is in the past
            if (delay < 0) {
                //node.status({fill:"red", shape:"ring", text:"Trigger time is in the past. No action taken."});
                node.status({fill:"yellow", shape:"ring", text:"waiting for payload..."});
                return; // Exit the function early
            }
            // Set a timeout to send the payload at the trigger time
            timeoutHandle = setTimeout(function() {
                node.send({payload: file_vars_dude.payload});
                node.status({fill:"green", shape:"dot", text:"completed at " + file_vars_dude.triggerTime});
                // Clear the handle after the timeout callback has been called
                timeoutHandle = null;
            }, delay);
        }

        // Function formatTime
        function formatTime(date) {
            return date.toTimeString().split(' ')[0];
        }

        // Function clearBuddysTimer
        function clearBuddysTimer() {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
                node.status({fill:"yellow", shape:"ring", text:"Timer cancelled"});
            }
        }

        // Handle input messages
        this.on('input', function(msg, send, done) {
            if (msg.payload === "STOP") {
                // Call the function to clear the timer
                clearBuddysTimer();
                // the node status to reflect that the timer was stopped
                node.status({fill: "red", shape: "dot", text: "STOP received"});
                // Since the timer is stopped, we don't want to execute more code, so we return
                return;
            }
            // clear the old timer first
            clearBuddysTimer();
            // Process the message and set the payload
            file_vars_dude.payload = msg.payload;
            // Check if msg.timer_seconds is a valid number before assigning
            // Inside the 'input' event handler
            if (msg.hasOwnProperty('timer_seconds') && !isNaN(Number(msg.timer_seconds))) {
                file_vars_dude.timer_seconds_bruh = Number(msg.timer_seconds);
            } else {
                // Revert to the original configuration value if msg.timer_seconds isn't provided
                file_vars_dude.timer_seconds_bruh = Number(node.timer_seconds_bruh);
            }
            // Calculate the future trigger time
            var futureTime = new Date(new Date().getTime() + file_vars_dude.timer_seconds_bruh * 1000);
            file_vars_dude.triggerTime = formatTime(futureTime);
            // Update the node status with the future trigger time
            node.status({fill:"blue", shape:"dot", text:"Alarm will trigger at " + file_vars_dude.triggerTime});
            // Convert the object to a string
            file_vars_dude.string_to_be_saved = JSON.stringify(file_vars_dude, null, 2); // The '2' argument here adds indentation to the JSON string for readability
            // Send the message on
            // Write the string to the file
            // Before writing the file, ensure that the directory exists
            const dir = path.dirname(file_vars_dude.filename);
            fs.mkdir(dir, { recursive: true }, (err) => {
                if (err) {
                    node.status({fill:"red", shape:"dot", text:"could not create directory"});
                    node.send({error: err});
                    return; // Exit if the directory could not be created
                }

                // Now that we know the directory exists, write the file
                fs.writeFile(file_vars_dude.filename, file_vars_dude.string_to_be_saved, function(err) { 
                    if (err) {
                        node.status({fill:"red", shape:"dot", text:"could not write to file"});
                        // Send an error message downstream in your flow
                        node.send({error: err});
                        return; // Now we return after sending the message
                    }
                    node.status({fill:"green", shape:"dot", text:"Wrote file successfully!"});
                    
                        //Read the file after writing to it
                    fs.readFile(file_vars_dude.filename, 'utf8', function(err, data) {
                        if (err) {
                            node.status({fill:"red", shape:"dot", text:"could not read file"});
                            node.error("Failed to read file: " + err);
                            // Send an error message downstream in your flow
                            node.send({error: err});
                            return;
                        }
                        try {
                            file_vars_dude = JSON.parse(data);
                            // Start timer with the seconds from file or config
                            buddys_timer();
                        } catch (parseErr) {
                            node.status({fill:"red", shape:"dot", text:"failed to parse file data"});
                            node.error("Failed to parse file data: " + parseErr);
                        }
                    });
                });
            });
        });
        // Handle the close event to clear the timeout
        node.on('close', function(removed, done) {
            clearBuddysTimer();
            if(done) {
                done();
            } 
        });
        // Read file and start timer on deploy
        readAndStartTimer();
    }
    // Register the node
    RED.nodes.registerType("buddys-simple-timer", BuddySumNode);

}
