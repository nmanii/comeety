function ApiClient(host) {
    this.host =  host;

    this.call = function(method, path, data, callback) {
        var absolutePath = this.host + path;
        $.ajax({
            method: method,
            url: absolutePath,
            xhrFields: { withCredentials:true },
            data: data
        })
            .done(function( data, textStatus, xhr ) {
                callback(xhr);
            })
            .fail(function( xhr, textStatus, data ) {
                callback(xhr);
            });
    }

    this.post = function(path, data, callback) {
        this.call('POST', path, data, callback);
    }

    this.get = function(path, data, callback) {
        this.call('GET', path, data, callback);
    }

    this.put = function(path, data, callback) {
        this.call('PUT', path, data, callback);
    }

    this.patch = function(path, data, callback) {
        this.call('PATCH', path, data, callback);
    }

    this.delete = function(path, data, callback) {
        this.call('DELETE', path, data, callback);
    }
}

function ApiClientAxios(host) {
    this.host =  host;

    this.call = function(method, path, data, callback) {
        var absolutePath = this.host + path;
        return axios({
            timeout:30000,
            method: method,
            url: absolutePath,
            withCredentials: true,
            data: data
        });
    }

    this.post = function(path, data, callback) {
        return this.call('POST', path, data, callback);
    }

    this.get = function(path, data, callback) {
        return this.call('GET', path, data, callback);
    }

    this.put = function(path, data, callback) {
        return this.call('PUT', path, data, callback);
    }

    this.patch = function(path, data, callback) {
        return this.call('PATCH', path, data, callback);
    }

    this.delete = function(path, data, callback) {
        return this.call('DELETE', path, data, callback);
    }
}