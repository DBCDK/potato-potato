# Potato Potato

Potato*2 is a webbased tool for comparing data from webservices. This is useful for comparing the content of e.g. Solr-instances,Fedora Commons, and anything else that talks http and has matchine-parsable output.

Potato*2 supports two types of webservices
1. webservices where a lot a key/value-pairs can be extracted, e.g. a list of fields with matching document counts from Solr
1. webservices that can be queried for single-value responses


## Installation

1. Make the `app` folder reachable on a webserver
2. There is no step 2.


## Making it do something

Different types of services can be split into modules, such as a Solr-module, a Fedora-module, ..., and each module can have
several datasources. A datasource is a single javascript-file, that can retrieve data e.g. using $http from AngularJS
(all datasources run inside an AngularJS application). See app/modules/*.
To make Potato*2 load a module, add it to app/modules.json.


## A note about headers the webservices must supply

As a result of running in a browser, webservices must set the relevant `Access-Control-Allow-*` headers, or browsers will refuse to load the external webservices.
If you can't add the appropriate headers directly to the service itselt, you can setup a proxy in front of it.
One common way of doing that, is to use Apache, with a configuration like this:

```apache
<Location /proxy>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Headers "Content-Type"
</Location>

ProxyPass /proxy/lakiseks/opensearch/test http://lakiseks.dbc.dk/test
ProxyPassReverse /proxy/lakiseks/opensearch/test http://lakiseks.dbc.dk/test
```

Remember to enable the following modules: `proxy`, `proxy_http`, `headers`
