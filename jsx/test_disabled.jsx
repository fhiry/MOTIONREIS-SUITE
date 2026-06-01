var seq = app.project.activeSequence;
var c = seq.videoTracks[0].clips[0];
var props = [];
for (var k in c) { props.push(k); }
alert(props.join(", "));
