(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('MonitorCtrl', ['$scope', '$stateParams', '$http', '$rootScope', 'baConfig', 'layoutPaths', '$state', 'pathManager',
            function ($scope, $stateParams, $http, $rootScope, baConfig, layoutPaths, $state, pathManager) {

                if (typeof $rootScope.profile === "undefined") {
                    $rootScope.pendingRedirect = {
                        state: $state.current.name,
                        params: $stateParams
                    };
                    return $state.go('login');
                }

                $scope.serverId = $stateParams.serverId;
                if (!$scope.serverId) {
                    return $state.go('new');
                }

                $scope.server = null;
                for (var i = 0; i < $rootScope.profile.servers.length; i++) {
                    var server = $rootScope.profile.servers[i];
                    if (server.id == $scope.serverId) {
                        $scope.server = server;
                        break;
                    }
                }
                if (!$scope.server) {
                    return $state.go('edit');
                }

                $("title").text($scope.server.title + " - BlurMonitor");

                $scope.serverIsUp = true;

                $scope.data = [];

                $scope.active = true;

                $scope.hoveredMeterId = null;

                $scope.onMeterMouseEnter = function () {
                    $scope.hoveredMeterId = $(this).attr("id");
                };

                $scope.onMeterMouseLeave = function () {
                    $scope.hoveredMeterId = null;
                };

                $scope.shouldDraw = function (id) {
                    return $scope.hoveredMeterId !== id;
                };

                $("body").on("mouseenter", ".meter", $scope.onMeterMouseEnter).on("mouseleave", ".meter", $scope.onMeterMouseLeave);

                $scope.$on("$destroy", function () {
                    $scope.active = false;
                    $("body").off("mouseenter", ".meter", $scope.onMeterMouseEnter).off("mouseleave", ".meter", $scope.onMeterMouseLeave);
                });

                $scope.update = function (callback) {
                    if (!$scope.active) {
                        return;
                    }
                    $http({
                        method: $scope.server.method,
                        url: $scope.server.url
                    })
                        .then(
                            function (response) {
                                if (response.status === 200) {
                                    $scope.serverIsUp = true;
                                    if (response.data) {
                                        $scope.data.push({
                                            time: $scope.getTime(),
                                            seconds: new Date().getTime() / 1000,
                                            data: response.data
                                        });
                                        if (callback) {
                                            callback(response.data);
                                        }
                                        else {
                                            $scope.draw();
                                        }
                                    }
                                }
                                else {
                                    $scope.serverIsUp = false;
                                }
                            }, function () {
                                $scope.serverIsUp = false;
                            }
                        );
                    setTimeout($scope.update, $scope.server.refreshRate * 1000);
                };

                $scope.draw = function () {
                    for (var i = 0; i < $scope.meters.length; i++) {
                        var meter = $scope.meters[i];
                        var id = "meter-wrapper-" + i;
                        if (!$scope.shouldDraw(id)) {
                            continue;
                        }
                        switch (meter.type) {
                            case "GRAPH":
                                $scope.drawGraph(i, meter.config);
                                break;
                            case "PIE":
                                $scope.drawPie(i, meter.config);
                                break;
                            case "VALUE":
                                $scope.drawValue(i, meter.config);
                                break;
                            case "TABLE":
                                $scope.drawTable(i, meter.config);
                                break;
                        }
                    }
                };

                $scope.drawGraph = function (index, config) {
                    var data = [];
                    var startIndex = 0;
                    var currentTime = new Date().getTime() / 1000;
                    for (var i = 0; i < $scope.data.length; i++) {
                        var diff = currentTime - $scope.data[i].seconds;
                        if (diff < config.maxHistory) {
                            startIndex = i;
                            break;
                        }
                    }
                    var rawData = $scope.data.slice(startIndex);
                    if (!rawData) {
                        return;
                    }
                    var graphIndex = -1;
                    var graphs = [];
                    for (i = 0; i < rawData.length; i++) {
                        data.push({time: rawData[i].time});
                    }
                    for (i = 0; i < config.participants.length; i++) {
                        var participant = config.participants[i];
                        if (participant.type === "INSTANCE") {
                            var graphId = "g" + ++graphIndex;
                            graphs.push({
                                id: graphId,
                                balloonText: participant.title + ' - [[value]]',
                                bullet: 'square',
                                bulletSize: 8,
                                lineColor: $scope.chooseColor(graphIndex),
                                fillColors: $scope.chooseColor(graphIndex),
                                lineThickness: 1,
                                valueField: graphId,
                                type: 'smoothedLine',
                                fillAlphas: config.participants.length === 1 && config.participants[0].type === "INSTANCE" ? 0.5 : 0
                            });
                            for (var j = 0; j < rawData.length; j++) {
                                data[j][graphId] = $scope.getEntryByPath(participant.valuePath, config.getBaseData(rawData[j].data));
                            }
                        }
                        else {
                            var sampleCollection = $scope.getEntryByPath(participant.collectionPath, config.getBaseData(rawData[0].data));
                            for (var key in sampleCollection) {
                                if (!sampleCollection.hasOwnProperty(key)) {
                                    continue;
                                }
                                graphId = "g" + ++graphIndex;
                                graphs.push({
                                    id: graphId,
                                    balloonText: $scope.getTitle(participant.titlePath, key, sampleCollection, participant.titlePrefix, participant.titleSuffix) + ' - [[value]]',
                                    bullet: 'square',
                                    bulletSize: 8,
                                    lineColor: $scope.chooseColor(graphIndex),
                                    fillColors: $scope.chooseColor(graphIndex),
                                    lineThickness: 1,
                                    valueField: graphId,
                                    type: 'smoothedLine',
                                    fillAlphas: config.participants.length === 1 && config.participants[0].type === "INSTANCE" ? 0.5 : 0
                                });
                                for (j = 0; j < rawData.length; j++) {
                                    var sample = $scope.getEntryByPath(participant.collectionPath, config.getBaseData(rawData[j].data));
                                    data[j][graphId] = $scope.getEntryByPath(participant.valuePath, sample[key]);
                                }
                            }
                        }
                    }
                    var lineChart = AmCharts.makeChart("meter" + index, {
                        type: 'serial',
                        theme: 'blur',
                        color: baConfig.colors.defaultText,
                        marginTop: 0,
                        marginRight: 15,
                        dataProvider: data,
                        categoryField: 'time',
                        valueAxes: [
                            {
                                axisAlpha: 0,
                                position: 'left',
                                gridAlpha: 0.5,
                                gridColor: baConfig.colors.border
                            }
                        ],
                        graphs: graphs,
                        chartScrollbar: {
                            graph: 'g1',
                            gridAlpha: 0,
                            color: baConfig.colors.defaultText,
                            scrollbarHeight: 55,
                            backgroundAlpha: 0,
                            selectedBackgroundAlpha: 0.05,
                            selectedBackgroundColor: baConfig.colors.defaultText,
                            graphFillAlpha: 0,
                            autoGridCount: true,
                            selectedGraphFillAlpha: 0,
                            graphLineAlpha: 0.2,
                            selectedGraphLineColor: baConfig.colors.defaultText,
                            selectedGraphLineAlpha: 1
                        },
                        chartCursor: {
                            cursorAlpha: 0,
                            valueLineEnabled: true,
                            valueLineBalloonEnabled: true,
                            valueLineAlpha: 0.5,
                            fullWidth: true
                        },
                        export: {
                            enabled: true
                        },
                        creditsPosition: 'bottom-right',
                        pathToImages: layoutPaths.images.amChart
                    });
                    lineChart.addListener('rendered', zoomChart);
                    if (lineChart.zoomChart) {
                        lineChart.zoomChart();
                    }
                    function zoomChart() {
                        lineChart.zoomToIndexes(Math.round(lineChart.dataProvider.length * 0.4), Math.round(lineChart.dataProvider.length * 0.55));
                    }
                };

                $scope.drawPie = function (index, config) {
                    if ($scope.data.length === 0) {
                        return;
                    }
                    var data = [];
                    var lastSample = config.getBaseData($scope.data[$scope.data.length - 1].data);
                    for (var i = 0; i < config.participants.length; i++) {
                        var participant = config.participants[i];
                        if (participant.type === "INSTANCE") {
                            data.push({
                                title: participant.title,
                                value: $scope.getEntryByPath(participant.valuePath, lastSample)
                            });
                        }
                        else {
                            var collection = $scope.getEntryByPath(participant.collectionPath, lastSample);
                            for (var key in collection) {
                                if (!collection.hasOwnProperty(key)) {
                                    continue;
                                }
                                data.push({
                                    title: $scope.getTitle(participant.titlePath, key, collection, participant.titlePrefix, participant.titleSuffix),
                                    value: $scope.getEntryByPath(participant.valuePath, collection[key])
                                });
                            }
                        }
                    }
                    var layoutColors = baConfig.colors;
                    var pieChart = AmCharts.makeChart("meter" + index, {
                        type: 'pie',
                        startDuration: 0,
                        theme: 'blur',
                        addClassNames: true,
                        color: layoutColors.defaultText,
                        labelTickColor: layoutColors.borderDark,
                        legend: {
                            position: 'right',
                            marginRight: 100,
                            autoMargins: false
                        },
                        innerRadius: '40%',
                        defs: {
                            filter: [
                                {
                                    id: 'shadow',
                                    width: '200%',
                                    height: '200%',
                                    feOffset: {
                                        result: 'offOut',
                                        in: 'SourceAlpha',
                                        dx: 0,
                                        dy: 0
                                    },
                                    feGaussianBlur: {
                                        result: 'blurOut',
                                        in: 'offOut',
                                        stdDeviation: 5
                                    },
                                    feBlend: {
                                        in: 'SourceGraphic',
                                        in2: 'blurOut',
                                        mode: 'normal'
                                    }
                                }
                            ]
                        },
                        dataProvider: data,
                        valueField: 'value',
                        titleField: 'title',
                        export: {
                            enabled: true
                        },
                        creditsPosition: 'bottom-left',
                        autoMargins: false,
                        marginTop: 10,
                        alpha: 0.8,
                        marginBottom: 30,
                        marginLeft: 0,
                        marginRight: 0,
                        pullOutRadius: 0,
                        pathToImages: layoutPaths.images.amChart,
                        responsive: {
                            enabled: false, // creating an issue of not reading settings each even re-draw
                            rules: [
                                // at 900px wide, we hide legend
                                {
                                    maxWidth: 900,
                                    overrides: {
                                        legend: {
                                            enabled: false
                                        }
                                    }
                                },
                                // at 200 px we hide value axis labels altogether
                                {
                                    maxWidth: 200,
                                    overrides: {
                                        valueAxes: {
                                            labelsEnabled: false
                                        },
                                        marginTop: 30,
                                        marginBottom: 30,
                                        marginLeft: 30,
                                        marginRight: 30
                                    }
                                }
                            ]
                        }
                    });
                    pieChart.addListener('init', function () {
                        pieChart.legend.addListener('rollOverItem', handleRollOver);
                    });
                    pieChart.addListener('rollOverSlice', function (e) {
                        handleRollOver(e);
                    });
                    function handleRollOver(e) {
                        var wedge = e.dataItem.wedge.node;
                        wedge.parentNode.appendChild(wedge);
                    }
                };

                $scope.drawValue = function (index, config) {
                    if ($scope.data.length === 0) {
                        return;
                    }
                    var lastSample = config.getBaseData($scope.data[$scope.data.length - 1].data);
                    var value = $scope.getEntryByPath(config.path, lastSample);
                    $("#meter" + index).addClass("value-view").html(config.prefix + value + config.suffix);
                };

                $scope.drawTable = function (index, config) {
                    if ($scope.data.length === 0) {
                        return;
                    }
                    var lastSample = config.getBaseData($scope.data[$scope.data.length - 1].data);
                    var headerValues = [""];
                    for (var i = 0; i < config.table.values.length; i++) {
                        headerValues.push(config.table.values[i].title);
                    }
                    var tableValues = [];
                    var collection = $scope.getEntryByPath(config.table.collectionPath, lastSample);
                    for (var key in collection) {
                        if (!collection.hasOwnProperty(key)) {
                            continue;
                        }
                        var row = [$scope.getTitle(config.table.titlePath, key, collection, config.table.titlePrefix, config.table.titleSuffix)];
                        for (i = 0; i < config.table.values.length; i++) {
                            row.push($scope.getEntryByPath(config.table.values[i].valuePath, collection[key]));
                        }
                        tableValues.push(row);
                    }
                    var headerHolder = $('<tr>');
                    for (i = 0; i < headerValues.length; i++) {
                        headerHolder.append($('<th>').html(headerValues[i]));
                    }
                    var tableHolder = $('<tbody>');
                    for (i = 0; i < tableValues.length; i++) {
                        var rowValues = tableValues[i];
                        var rowHolder = $('<tr>').addClass("no-top-border");
                        for (var j = 0; j < rowValues.length; j++) {
                            rowHolder.append($('<td>').html(rowValues[j]));
                        }
                        tableHolder.append(rowHolder);
                    }
                    $("#meter" + index).html(
                        $('<div>').addClass("horizontal-scroll").append(
                            $('<table>').addClass("table table-hover").append(
                                $('<thead>').append(headerHolder),
                                tableHolder
                            )
                        )
                    );
                };

                $scope.getEntryByPath = function (pathArray, sample) {
                    return pathManager.walkPath(sample, pathArray, pathArray.length);
                };

                $scope.getTitle = function (titlePath, key, sample, prefix, suffix) {
                    var title = titlePath === "{{key}}" ? key : $scope.getEntryByPath(titlePath, sample[key]);
                    if (prefix) {
                        title = prefix + " " + title;
                    }
                    if (suffix) {
                        title += " " + suffix;
                    }
                    return title;
                };

                $scope.getTime = function () {
                    var date = new Date();
                    var minutes = date.getMinutes();
                    if (minutes < 10) {
                        minutes = "0" + minutes;
                    }
                    var seconds = date.getSeconds();
                    if (seconds < 10) {
                        seconds = "0" + seconds;
                    }
                    return date.getHours() + ":" + minutes + ":" + seconds;
                };

                $scope.normalizeValue = function (value) {
                    if (!$.isNumeric(value)) {
                        return value;
                    }
                    var result = $scope.formatNumber(value, 3, '.', ',');
                    return result.substr(-3) === "000" ? result.substr(0, result.length - 4) : result;
                };

                $scope.formatNumber = function (number, decimals, decPoint, thousandsSep) {
                    var n = !isFinite(+number) ? 0 : +number,
                        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                        sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep,
                        dec = (typeof decPoint === 'undefined') ? '.' : decPoint,
                        toFixedFix = function (n, prec) {
                            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
                            var k = Math.pow(10, prec);
                            return Math.round(n * k) / k;
                        },
                        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
                    if (s[0].length > 3) {
                        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
                    }
                    if ((s[1] || '').length < prec) {
                        s[1] = s[1] || '';
                        s[1] += new Array(prec - s[1].length + 1).join('0');
                    }
                    return s.join(dec);
                };

                var colors = [
                    baConfig.colors.primary,
                    baConfig.colors.danger,
                    baConfig.colors.warning,
                    baConfig.colors.success,
                    baConfig.colors.info,
                    baConfig.colors.primaryDark,
                    baConfig.colors.warningLight,
                    baConfig.colors.successDark,
                    baConfig.colors.successLight,
                    baConfig.colors.primaryLight,
                    baConfig.colors.warningDark
                ];

                $scope.chooseColor = function (index) {
                    return colors[index % colors.length];
                };

                $scope.update(function (sample) {
                    $scope.meters = [];
                    for (var i = 0; i < $scope.server.meters.length; i++) {
                        var meter = $scope.server.meters[i];
                        if (!meter.isPrototype) {
                            meter.config.getBaseData = function (sample) {
                                return sample;
                            };
                            $scope.meters.push(meter);
                            continue;
                        }
                        var prototypeCollection = meter.prototypeCollection;
                        var collection = $scope.getEntryByPath(prototypeCollection.collectionPath, sample);
                        for (var key in collection) {
                            if (!collection.hasOwnProperty(key)) {
                                continue;
                            }
                            var meterCopy = JSON.parse(JSON.stringify(meter));
                            meterCopy.title = $scope.getTitle(prototypeCollection.titlePath, key, collection,
                                prototypeCollection.titlePrefix, prototypeCollection.titleSuffix);
                            (function (collectionPath, key) {
                                meterCopy.config.getBaseData = function (sample) {
                                    return $scope.getEntryByPath(collectionPath, sample)[key];
                                };
                            })(prototypeCollection.collectionPath, key);
                            $scope.meters.push(meterCopy);
                        }
                    }
                    $scope.$$postDigest(function () {
                        $scope.draw();
                    });
                });

            }]);
})();