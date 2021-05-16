+++
title = "Networking"
weight = 4
sort_by = "weight"
insert_anchor_links = "right"
+++

`@javelin/net` provides the means to synchronize Javelin worlds over your network transport of choice.

Currently, the Javelin protocol doesn't control any aspect of your networking layer, meaning it can work with either unreliable transports (WebRTC, WebTransport), reliable transports (WebSockets), or a combination of both. The only requirement is that your transport must support binary data (e.g. ArrayBuffers).
