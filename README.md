# Pm2 Service Discovery

This pm2 module will help you to expose product's metrics from pm2 instances.
It will automatically listen for all your commands like:
```bash
$ pm2 scale <pm2_id|name> <number>
$ pm2 stop <pm2_id|name>
$ pm2 start <pm2_id|name>
```
And will generate target's list for each instance `host:port`
and then expose to your prometheus.

## Install
Install via npm
```bash
$ pm2 install pm2-service-discovery
```

### Set your configs

Set `host` and `port` for generate target. Later prometheus will take this host for scrapping 
```bash
$ pm2 set pm2-service-discovery:target_host <your host>
$ pm2 set pm2-service-discovery:target_base_port <your port>
```
The result port value for each instance will be (`base_port` + `pm2_id`)
For example if you set `target_host = localhost` and `target_base_port = 9300`
And if you have instances with `pm2_id = 1` and `pm2_id = 11` Prometheus will came for metrics to:
* `localhost:9301/metrics`
* `localhost:9311/metrics`

Set filter value for pm2 app names.
This module will give only apps which has status `online` and name starts with this config value 
```bash
$ pm2 set pm2-service-discovery:app_name_filter <instance name with metrics>
```

Set port for service discovery
```bash
$ pm2 set pm2-service-discovery:pm2_service_discovery_port <port>
```

Then all you need is add several lines to `prometheus.yml` config and restart prometheus:
```text
- job_name: "publishing"
    scrape_interval: "5s"
    consul_sd_configs:
      - server: '<pm2 service discovery host>:<pm2_service_discovery_port>'
      - services: ['pm2_service_discovery'] # it can should be the same as config value service_name
```
