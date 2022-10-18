# Datacat

Datacat is a monitoring and alerting system.

By collecting data then visualizing with charts and dashboards,
Datacat helps users to monitor across systems, containers and applications in one place.

Datacat also notifies users of performance problems or critical issues with an alerting system,
make it easier for users to maintain their system and to analyze their services performance.

![dataCat_laptop](https://user-images.githubusercontent.com/104906155/195975604-b83f1484-8507-4090-9afb-1505762e31ae.png)

_Datacat do more than cat._

Datacat demo website: [https://datacat.cloud](https://datacat.cloud/)

## Test Accounts

```
Email: peter@test.com

Password: Test123
```

## Table of Contents

-   [Features](#Features)

-   [How to Install](#How-to-Install)

-   [How to Use](#How-to-Use)

-   [Architecture](#Architecture)

-   [Tech Stack](#Tech-Stack)

-   [Future Features](#Future-Features)

-   [Contact](#Contact)

## Features

-   Collect metrics of system, container, application periodically using [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) and [DataCatPaw](https://www.npmjs.com/package/@weigen393/datacatpaw).
-   Visualizing real-time metrics and performance data using jQuery Flot.
-   Allows users to set thresholds for metrics, and alerts are triggered when thresholds exceed users specification.
-   Provided email and [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) as the notification target for alerts.
-   Provided health check on system, container and application metrics.
-   Built a worker checking scheduled alerts continuously utilizing [Redis](https://redis.io/) sorted set.
-   Implemented real-time alert on website page using [Redis](https://redis.io/) publish/subscribe and [Server-sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

## How to Install

Comming soon

## How to Use

-   Create a dashboard
    <<<<<<< HEAD

-   Create a chart

-   Create an alert

-   # Create a notification

        ![create_dashboard](https://user-images.githubusercontent.com/104906155/196384670-b6dc2661-55db-4570-87ee-d247ec2803df.gif)

-   Create a chart
    ![create_chart](https://user-images.githubusercontent.com/104906155/196384780-69447bc2-b55a-42ce-9a17-a4b2f6db205c.gif)

-   Create an alert
    ![create_alert](https://user-images.githubusercontent.com/104906155/196384882-4664356c-a822-4c61-a18c-6d91deb45414.gif)

-   Create a notification
    ![create_notify](https://user-images.githubusercontent.com/104906155/196384958-fc640dbd-4b4f-4022-ab34-180783e722b9.gif)

-   Dashboards
    ![dashboards](https://user-images.githubusercontent.com/104906155/196385075-01bce12f-d448-43c0-999c-14ced99414de.gif)

-   Alert
    ![show_alert](https://user-images.githubusercontent.com/104906155/196385355-6917a8dc-f6fb-4a9e-8fb2-73050ae9588b.gif)
    ![show_ok](https://user-images.githubusercontent.com/104906155/196385453-9fbaa8dc-e53b-42d1-a4aa-aac511ce5f70.gif)
    > > > > > > > develop

## Architecture

![image](https://user-images.githubusercontent.com/104906155/195979320-d0313fdd-3721-4940-904c-0b9ea94439e0.png)

## Tech Stack

-   **Back-End:** Node.js, Express

-   **Front-End:** HTML, CSS, JavaScript, jQuery, Bootstrap

-   **Database:** InfluxDB, MongoDB, Redis

-   **AWS:** EC2

## Future Features

-   Docker compose version

-   Log management system

## Contact

-   Author: [weigen393](https://github.com/weigen393)
-   Email: weigen393@gmail.com
