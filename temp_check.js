
                        function applyWiggle() {
                            var freq = document.getElementById('wig-freq').value;
                            var amp = document.getElementById('wig-amp').value;
                            var loop = document.getElementById('wig-loop').checked;
                            exec('motion', 'applyWiggle', { freq: freq, amp: amp, loop: loop });
                        }

                        // ── OS RAM Purge ────────────────────────────────────────────────
                        function purgeOSRAM() {
                            var os = require('os');
                            var cp = require('child_process');
                            var isMac = os.platform() === 'darwin';

                            if (isMac) {
                                showToast("Requesting Admin access to purge RAM...", "success");
                                // Uses AppleScript to prompt for password natively
                                cp.exec('osascript -e \'do shell script "purge" with administrator privileges\'', function(err, stdout, stderr) {
                                    if (err) {
                                        showToast("RAM Purge Cancelled or Failed.", "error");
                                    } else {
                                        showToast("System RAM Purged Successfully!", "success");
                                    }
                                });
                            } else {
                                showToast("Processing System Idle Tasks...", "success");
                                // Windows doesn't have a direct 'sudo purge', so we trigger ProcessIdleTasks to flush memory 
                                cp.exec('rundll32.exe advapi32.dll,ProcessIdleTasks', function(err, stdout, stderr) {
                                    showToast("System Memory Optimized.", "success");
                                });
                            }
                        }
                        