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

    $rootScope.servers = {
        example: {
            title: "Example Server",
            url: "http://localhost:8080/metrics",
            meters: [
                {
                    title: "Total Count - get_user_by_id",
                    width: 12,
                    type: "GRAPH",
                    config: {
                        maxHistory: 12,
                        fill: true,
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
                                conditions: {title: "Enter"},
                                result: "value"
                            },
                            {
                                type: "ARRAY",
                                conditions: {title: "Total Count"},
                                result: "value"
                            }
                        ]
                    }
                },
                {
                    title: "Total Count Comparison",
                    width: 12,
                    type: "PIE",
                    config: {
                        participants: [
                            {
                                title: "get_user_by_id",
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
                                        conditions: {title: "Enter"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Total Count"},
                                        result: "value"
                                    }
                                ]
                            },
                            {
                                title: "get_user_by_id_2",
                                path: [
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Endpoint"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "GET /get_user_by_id_2"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Enter"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Total Count"},
                                        result: "value"
                                    }
                                ]
                            }
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
                        rows: {
                            path: [
                                {
                                    type: "ARRAY",
                                    conditions: {title: "Endpoint"},
                                    result: "value"
                                }
                            ],
                            titleField: "title",
                            valueField: "value"
                        },
                        columns: [
                            {
                                title: "Enter Per Sec.",
                                path: [
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Enter"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Mean Rate"},
                                        result: "value"
                                    }
                                ]
                            },
                            {
                                title: "Exit Per Sec.",
                                path: [
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Exit"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Mean Rate"},
                                        result: "value"
                                    }
                                ]
                            },
                            {
                                title: "Currently Active",
                                path: [
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Active"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Count"},
                                        result: "value"
                                    }
                                ]
                            },
                            {
                                title: "Median Duration",
                                path: [
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
                            },
                            {
                                title: "98 Perc. Duration",
                                path: [
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "Duration"},
                                        result: "value"
                                    },
                                    {
                                        type: "ARRAY",
                                        conditions: {title: "98th Percentile"},
                                        result: "value"
                                    }
                                ]
                            },
                        ]
                    }
                },
            ]
        }
    };

    baSidebarService.addStaticItem({
        title: 'Example',
        icon: 'ion-android-home',
        stateRef: 'monitor/example'
    });

    baSidebarService.addStaticItem({
        title: 'Add New Pages',
        icon: 'ion-android-add-circle',
        stateRef: 'new'
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

    $scope.update = function () {
        $http
            .get($scope.server.url)
            .then(
                function (response) {
                    if (response.data) {
                        $scope.data.push({
                            time: $scope.getTime(),
                            data: response.data
                        });
                        $scope.draw();
                    }
                }, function () {
                    alert("Something went wrong");
                }
            );
        setTimeout($scope.update, 5000);
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
        for (var i = startIndex; i < $scope.data.length; i++) {
            data.push({
                time: $scope.data[i].time,
                value: $scope.getEntryByPath(config.path, $scope.data[i].data)
            });
        }
        var layoutColors = baConfig.colors;
        var lineChart = AmCharts.makeChart("meter" + index, {
            type: 'serial',
            theme: 'blur',
            color: layoutColors.defaultText,
            marginTop: 0,
            marginRight: 15,
            dataProvider: data,
            categoryField: 'time',
            valueAxes: [
                {
                    axisAlpha: 0,
                    position: 'left',
                    gridAlpha: 0.5,
                    gridColor: layoutColors.border
                }
            ],
            graphs: [
                {
                    id: 'g1',
                    balloonText: '[[value]]',
                    bullet: 'square',
                    bulletSize: 8,
                    lineColor: layoutColors.primary,
                    fillColors: layoutColors.primary,
                    lineThickness: 1,
                    valueField: 'value',
                    type: 'smoothedLine',
                    fillAlphas: config.fill ? 0.5 : 0,
                    // fillColorsField: 'lineColor',
                    // lineColorField: 'lineColor',
                }
            ],
            chartScrollbar: {
                graph: 'g1',
                gridAlpha: 0,
                color: layoutColors.defaultText,
                scrollbarHeight: 55,
                backgroundAlpha: 0,
                selectedBackgroundAlpha: 0.05,
                selectedBackgroundColor: layoutColors.defaultText,
                graphFillAlpha: 0,
                autoGridCount: true,
                selectedGraphFillAlpha: 0,
                graphLineAlpha: 0.2,
                selectedGraphLineColor: layoutColors.defaultText,
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
            data.push({
                title: participant.title,
                value: $scope.getEntryByPath(participant.path, lastSample)
            });
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
                autoMargins: false,
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
        for (var i = 0; i < config.columns.length; i++) {
            headerValues.push(config.columns[i].title);
        }
        var tableValues = [];
        var rowsData = $scope.getEntryByPath(config.rows.path, lastSample);
        for (var key in rowsData) {
            var rowData = rowsData[key];
            var title = config.rows.titleField === "{{key}}" ? key : rowData[config.rows.titleField];
            var row = [title];
            for (i = 0; i < config.columns.length; i++) {
                var value = $scope.getEntryByPath(config.columns[i].path, rowData[config.rows.valueField]);
                row.push(value);
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

    $scope.update();

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