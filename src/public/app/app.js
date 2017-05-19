'use strict';

angular
    .module('BlurAdmin', [
        'ngAnimate',
        'ui.bootstrap',
        'ui.sortable',
        'ui.router',
        'ngTouch',
        'toastr',
        'smart-table',
        "xeditable",
        'ui.slimscroll',
        'ngJsTree',
        'angular-progress-button-styles',
        'BlurAdmin.theme'
    ])
    .config(amChartConfig)
    .config(routesConfig)
    .run(initialize)
    .controller('MonitorCtrl', monitorCtrl);

function routesConfig($stateProvider) {
    $stateProvider
        .state('monitor', {
            url: '/monitor/:serverId',
            title: 'Monitor',
            templateUrl: 'app/monitor.html',
            controller: 'MonitorCtrl'
        });
}

/** @ngInject */
function initialize($rootScope, baSidebarService, $state) {

    baSidebarService.addStaticItem({
        title: 'Add New Pages',
        icon: 'ion-android-add-circle',
        stateRef: 'new'
    });

    $rootScope.servers = {
        example: {
            title: "Example Server",
            url: "http://localhost:8080/metrics",
            meters: [
                {
                    prototypeCollection: new PrototypeCollection(
                        [new PathArrayEntry({title: "Endpoint"}, "value")],
                        "",
                        [new PathObjectEntry("title")],
                        "Exit Rate"
                    ),
                    width: 12,
                    type: "GRAPH",
                    config: {
                        maxHistory: 12,
                        participants: [
                            new ValueInstance("get_user_by_id exit rate", [
                                new PathObjectEntry("value"),
                                new PathArrayEntry({title: "Exit"}, "value"),
                                new PathArrayEntry({title: "Mean Rate"}, "value")
                            ])
                        ]
                    }
                },
                {
                    title: "Endpoint Comparison",
                    width: 12,
                    type: "GRAPH",
                    config: {
                        maxHistory: 12,
                        participants: [
                            new ValueInstance("get_user_by_id exit rate", [
                                new PathArrayEntry({title: "Endpoint"}, "value"),
                                new PathArrayEntry({title: "GET /get_user_by_id"}, "value"),
                                new PathArrayEntry({title: "Exit"}, "value"),
                                new PathArrayEntry({title: "Mean Rate"}, "value")
                            ]),
                            new ValueCollection(
                                [new PathArrayEntry({title: "Endpoint"}, "value")],
                                [new PathObjectEntry("title")],
                                [
                                    new PathObjectEntry("value"),
                                    new PathArrayEntry({title: "Enter"}, "value"),
                                    new PathArrayEntry({title: "Mean Rate"}, "value")
                                ]
                            )
                        ]
                    }
                },
                {
                    title: "Total Count Comparison",
                    width: 12,
                    type: "PIE",
                    config: {
                        participants: [
                            new ValueInstance("get_user_by_id exit rate", [
                                new PathArrayEntry({title: "Endpoint"}, "value"),
                                new PathArrayEntry({title: "GET /get_user_by_id"}, "value"),
                                new PathArrayEntry({title: "Exit"}, "value"),
                                new PathArrayEntry({title: "Total Count"}, "value")
                            ]),
                            new ValueCollection(
                                [new PathArrayEntry({title: "Endpoint"}, "value")],
                                [new PathObjectEntry("title")],
                                [
                                    new PathObjectEntry("value"),
                                    new PathArrayEntry({title: "Enter"}, "value"),
                                    new PathArrayEntry({title: "Total Count"}, "value")
                                ]
                            )
                        ]
                    }
                },
                {
                    title: "Mean Time",
                    width: 3,
                    type: "VALUE",
                    config: {
                        prefix: "",
                        suffix: "ms",
                        path: [
                            {
                                type: "ARRAY",
                                conditions: {title: "Endpoint"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "GET /get_user_by_id"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Duration"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Mean"},
                                result: "value"
                            }
                        ]
                    }
                },
                {
                    title: "Min Time",
                    width: 3,
                    type: "VALUE",
                    config: {
                        prefix: "",
                        suffix: "ms",
                        path: [
                            {
                                type: "ARRAY",
                                conditions: {title: "Endpoint"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "GET /get_user_by_id"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Duration"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Min"},
                                result: "value"
                            }
                        ]
                    }
                },
                {
                    title: "Max Time",
                    width: 3,
                    type: "VALUE",
                    config: {
                        prefix: "",
                        suffix: "ms",
                        path: [
                            {
                                type: "ARRAY",
                                conditions: {title: "Endpoint"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "GET /get_user_by_id"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Duration"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Max"},
                                result: "value"
                            }
                        ]
                    }
                },
                {
                    title: "Standard Deviation",
                    width: 3,
                    type: "VALUE",
                    config: {
                        prefix: "",
                        suffix: "%",
                        path: [
                            {
                                type: "ARRAY",
                                conditions: {title: "Endpoint"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "GET /get_user_by_id"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Duration"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Standard Deviation"},
                                result: "value"
                            }
                        ]
                    }
                },
                {
                    title: "Endpoint Analysis",
                    width: 12,
                    type: "TABLE",
                    config: {
                        table: new TableCollection(
                            [new PathArrayEntry({title: "Endpoint"}, "value")],
                            [new PathObjectEntry("title")],
                            [
                                new TableValue("Enter Per Sec.", [
                                    new PathObjectEntry("value"),
                                    new PathArrayEntry({title: "Enter"}, "value"),
                                    new PathArrayEntry({title: "Mean Rate"}, "value")
                                ]),
                                new TableValue("Exit Per Sec.", [
                                    new PathObjectEntry("value"),
                                    new PathArrayEntry({title: "Exit"}, "value"),
                                    new PathArrayEntry({title: "Mean Rate"}, "value")
                                ]),
                                new TableValue("Currently Active", [
                                    new PathObjectEntry("value"),
                                    new PathArrayEntry({title: "Active"}, "value"),
                                    new PathArrayEntry({title: "Count"}, "value")
                                ]),
                                new TableValue("Median Duration", [
                                    new PathObjectEntry("value"),
                                    new PathArrayEntry({title: "Duration"}, "value"),
                                    new PathArrayEntry({title: "Mean"}, "value")
                                ]),
                                new TableValue("98 Perc. Duration", [
                                    new PathObjectEntry("value"),
                                    new PathArrayEntry({title: "Duration"}, "value"),
                                    new PathArrayEntry({title: "98th Percentile"}, "value")
                                ])
                            ]
                        )
                    }
                }
            ]
        }
    };

    baSidebarService.addStaticItem({
        title: 'Example',
        icon: 'ion-android-home',
        stateRef: 'monitor/example'
    });

    $state.go('monitor', {serverId: 'example'});

}

/** @ngInject */
function monitorCtrl($scope, $stateParams, $http, $rootScope, $location, baConfig, layoutPaths) {

    $scope.serverId = $stateParams.serverId;
    if (!$scope.serverId) {
        return $location.path('/');
    }

    $scope.server = $rootScope.servers[$scope.serverId];
    if (!$scope.server) {
        return $location.path('/');
    }

    $scope.data = [];

    $scope.update = function (callback) {
        $http
            .get($scope.server.url)
            .then(
                function (response) {
                    if (response.data) {
                        $scope.data.push({
                            time: $scope.getTime(),
                            data: response.data
                        });
                        if (callback) {
                            callback(response.data);
                        }
                        $scope.draw();
                    }
                }, function () {
                    alert("Something went wrong");
                }
            );
        setTimeout($scope.update, 5000);
    };

    $scope.draw = function () {
        for (var i = 0; i < $scope.server.meters.length; i++) {
            var meter = $scope.server.meters[i];
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
        var startIndex = config.maxHistory ? Math.max(0, $scope.data.length - config.maxHistory) : 0;
        var rawData = $scope.data.slice(startIndex);
        if (!rawData) {
            return;
        }
        var graphIndex = 0;
        var graphs = [];
        for (var i = 0; i < rawData.length; i++) {
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
                    data[j][graphId] = $scope.getEntryByPath(participant.valuePath, rawData[j].data);
                }
            }
            else {
                var sampleCollection = $scope.getEntryByPath(participant.collectionPath, rawData[0].data);
                for (var key in sampleCollection) {
                    if (!sampleCollection.hasOwnProperty(key)) {
                        continue;
                    }
                    graphId = "g" + ++graphIndex;
                    graphs.push({
                        id: graphId,
                        balloonText: $scope.getTitle(participant.titlePath, key, sampleCollection) + ' - [[value]]',
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
                        var sample = $scope.getEntryByPath(participant.collectionPath, rawData[j].data);
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
        var lastSample = $scope.data[$scope.data.length - 1].data;
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
                        title: $scope.getTitle(participant.titlePath, key, collection),
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
        var lastSample = $scope.data[$scope.data.length - 1].data;
        var value = $scope.getEntryByPath(config.path, lastSample);
        $("#meter" + index).addClass("value-view").html(config.prefix + value + config.suffix);
    };

    $scope.drawTable = function (index, config) {
        if ($scope.data.length === 0) {
            return;
        }
        var lastSample = $scope.data[$scope.data.length - 1].data;
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
            var row = [$scope.getTitle(config.table.titlePath, key, collection)];
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
        if (pathArray.length === 0) {
            return $scope.normalizeValue(sample);
        }
        if (!sample) {
            throw "could not extract entry path";
        }
        var currentInstruction = pathArray[0];
        if (currentInstruction.type === "ARRAY") {
            for (var i = 0; i < sample.length; i++) {
                var isValid = true;
                var sampleEntry = sample[i];
                for (var key in currentInstruction.conditions) {
                    if (!currentInstruction.conditions.hasOwnProperty(key)) {
                        continue;
                    }
                    if (sampleEntry[key] !== currentInstruction.conditions[key]) {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    return $scope.getEntryByPath(pathArray.slice(1), sampleEntry[currentInstruction.result]);
                }
            }
            throw "could not extract entry path - array not match";
        }
        else if (currentInstruction.type === "OBJECT") {
            return $scope.getEntryByPath(pathArray.slice(1), sample[currentInstruction.result]);
        }
        return $scope.normalizeValue(sample);
    };

    $scope.getTitle = function (titlePath, key, sample) {
        return titlePath === "{{key}}" ? key : $scope.getEntryByPath(titlePath, sample[key]);
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
            if (!meter.hasOwnProperty("prototypeCollection")) {
                $scope.meters.push(meter);
                continue;
            }
            var prototypeCollection = meter.prototypeCollection;
            
        }
    });

}


function amChartConfig(baConfigProvider) {
    var layoutColors = baConfigProvider.colors;
    AmCharts.themes.blur = {

        themeName: "blur",

        AmChart: {
            color: layoutColors.defaultText,
            backgroundColor: "#FFFFFF"
        },

        AmCoordinateChart: {
            colors: [layoutColors.primary, layoutColors.danger, layoutColors.warning, layoutColors.success, layoutColors.info, layoutColors.primaryDark, layoutColors.warningLight, layoutColors.successDark, layoutColors.successLight, layoutColors.primaryLight, layoutColors.warningDark]
        },

        AmStockChart: {
            colors: [layoutColors.primary, layoutColors.danger, layoutColors.warning, layoutColors.success, layoutColors.info, layoutColors.primaryDark, layoutColors.warningLight, layoutColors.successDark, layoutColors.successLight, layoutColors.primaryLight, layoutColors.warningDark]
        },

        AmSlicedChart: {
            colors: [layoutColors.primary, layoutColors.danger, layoutColors.warning, layoutColors.success, layoutColors.info, layoutColors.primaryDark, layoutColors.warningLight, layoutColors.successDark, layoutColors.successLight, layoutColors.primaryLight, layoutColors.warningDark],
            labelTickColor: "#FFFFFF",
            labelTickAlpha: 0.3
        },

        AmRectangularChart: {
            zoomOutButtonColor: '#FFFFFF',
            zoomOutButtonRollOverAlpha: 0.15,
            zoomOutButtonImage: "lens.png"
        },

        AxisBase: {
            axisColor: "#FFFFFF",
            axisAlpha: 0.3,
            gridAlpha: 0.1,
            gridColor: "#FFFFFF"
        },

        ChartScrollbar: {
            backgroundColor: "#FFFFFF",
            backgroundAlpha: 0.12,
            graphFillAlpha: 0.5,
            graphLineAlpha: 0,
            selectedBackgroundColor: "#FFFFFF",
            selectedBackgroundAlpha: 0.4,
            gridAlpha: 0.15
        },

        ChartCursor: {
            cursorColor: layoutColors.primary,
            color: "#FFFFFF",
            cursorAlpha: 0.5
        },

        AmLegend: {
            color: "#FFFFFF"
        },

        AmGraph: {
            lineAlpha: 0.9
        },
        GaugeArrow: {
            color: "#FFFFFF",
            alpha: 0.8,
            nailAlpha: 0,
            innerRadius: "40%",
            nailRadius: 15,
            startWidth: 15,
            borderAlpha: 0.8,
            nailBorderAlpha: 0
        },

        GaugeAxis: {
            tickColor: "#FFFFFF",
            tickAlpha: 1,
            tickLength: 15,
            minorTickLength: 8,
            axisThickness: 3,
            axisColor: '#FFFFFF',
            axisAlpha: 1,
            bandAlpha: 0.8
        },

        TrendLine: {
            lineColor: layoutColors.danger,
            lineAlpha: 0.8
        },

        // ammap
        AreasSettings: {
            alpha: 0.8,
            color: layoutColors.info,
            colorSolid: layoutColors.primaryDark,
            unlistedAreasAlpha: 0.4,
            unlistedAreasColor: "#FFFFFF",
            outlineColor: "#FFFFFF",
            outlineAlpha: 0.5,
            outlineThickness: 0.5,
            rollOverColor: layoutColors.primary,
            rollOverOutlineColor: "#FFFFFF",
            selectedOutlineColor: "#FFFFFF",
            selectedColor: "#f15135",
            unlistedAreasOutlineColor: "#FFFFFF",
            unlistedAreasOutlineAlpha: 0.5
        },

        LinesSettings: {
            color: "#FFFFFF",
            alpha: 0.8
        },

        ImagesSettings: {
            alpha: 0.8,
            labelColor: "#FFFFFF",
            color: "#FFFFFF",
            labelRollOverColor: layoutColors.primaryDark
        },

        ZoomControl: {
            buttonFillAlpha: 0.8,
            buttonIconColor: layoutColors.defaultText,
            buttonRollOverColor: layoutColors.danger,
            buttonFillColor: layoutColors.primaryDark,
            buttonBorderColor: layoutColors.primaryDark,
            buttonBorderAlpha: 0,
            buttonCornerRadius: 0,
            gridColor: "#FFFFFF",
            gridBackgroundColor: "#FFFFFF",
            buttonIconAlpha: 0.6,
            gridAlpha: 0.6,
            buttonSize: 20
        },

        SmallMap: {
            mapColor: "#000000",
            rectangleColor: layoutColors.danger,
            backgroundColor: "#FFFFFF",
            backgroundAlpha: 0.7,
            borderThickness: 1,
            borderAlpha: 0.8
        },

        // the defaults below are set using CSS syntax, you can use any existing css property
        // if you don't use Stock chart, you can delete lines below
        PeriodSelector: {
            color: "#FFFFFF"
        },

        PeriodButton: {
            color: "#FFFFFF",
            background: "transparent",
            opacity: 0.7,
            border: "1px solid rgba(0, 0, 0, .3)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            boxSizing: "border-box"
        },

        PeriodButtonSelected: {
            color: "#FFFFFF",
            backgroundColor: "#b9cdf5",
            border: "1px solid rgba(0, 0, 0, .3)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            opacity: 1,
            boxSizing: "border-box"
        },

        PeriodInputField: {
            color: "#FFFFFF",
            background: "transparent",
            border: "1px solid rgba(0, 0, 0, .3)",
            outline: "none"
        },

        DataSetSelector: {
            color: "#FFFFFF",
            selectedBackgroundColor: "#b9cdf5",
            rollOverBackgroundColor: "#a8b0e4"
        },

        DataSetCompareList: {
            color: "#FFFFFF",
            lineHeight: "100%",
            boxSizing: "initial",
            webkitBoxSizing: "initial",
            border: "1px solid rgba(0, 0, 0, .3)"
        },

        DataSetSelect: {
            border: "1px solid rgba(0, 0, 0, .3)",
            outline: "none"
        }

    };
}

function ValueInstance(title, valuePath) {
    this.type = "INSTANCE";
    this.title = title;
    this.valuePath = valuePath;
}

function ValueCollection(collectionPath, titlePath, valuePath) {
    this.type = "COLLECTION";
    this.collectionPath = collectionPath;
    this.titlePath = titlePath;
    this.valuePath = valuePath;
}

function TableCollection(collectionPath, titlePath, values) {
    this.collectionPath = collectionPath;
    this.titlePath = titlePath;
    this.values = values;
}

function TableValue(title, valuePath) {
    this.title = title;
    this.valuePath = valuePath;
}

function PrototypeCollection(collectionPath, titlePrefix, titlePath, titleSuffix) {
    this.collectionPath = collectionPath;
    this.titlePrefix = titlePrefix;
    this.titlePath = titlePath;
    this.titleSuffix = titleSuffix;
}

function PathArrayEntry(conditions, result) {
    this.type = "ARRAY";
    this.conditions = conditions;
    this.result = result;
}

function PathObjectEntry(result) {
    this.type = "OBJECT";
    this.result = result;
}

function PathValueEntry() {
    this.type = "OTHER";
}