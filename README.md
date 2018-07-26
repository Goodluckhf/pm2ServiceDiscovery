# Pm2 Service Discovery
![Travis](https://img.shields.io/travis/Goodluckhf/pm2ServiceDiscovery/master.svg?style=flat-square)
![Coveralls github branch](https://img.shields.io/coveralls/github/Goodluckhf/pm2ServiceDiscovery/master.svg?style=flat-square)
![node](https://img.shields.io/node/v/pm2-service-discovery-prom.svg?style=flat-square)
![npm](https://img.shields.io/npm/v/pm2-service-discovery-prom.svg?style=flat-square)

![GitHub top language](https://img.shields.io/github/languages/top/Goodluckhf/pm2ServiceDiscovery.svg?style=flat-square)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Goodluckhf/pm2ServiceDiscovery.svg?style=flat-square)
![David](https://img.shields.io/david/Goodluckhf/pm2ServiceDiscovery.svg?style=flat-square)
![David](https://img.shields.io/david/dev/Goodluckhf/pm2ServiceDiscovery.svg?style=flat-square)

![license](https://img.shields.io/github/license/Goodluckhf/pm2ServiceDiscovery.svg?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/Goodluckhf/pm2ServiceDiscovery.svg?style=flat-square)
![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)

[![NPM](https://nodei.co/npm/pm2-service-discovery-prom.png?downloads=true&downloadRank=true)](https://nodei.co/npm/pm2-service-discovery-prom/)
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
