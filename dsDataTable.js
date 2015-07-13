(function ($) {

    var _dsSettings_default = {
        search: {
            active: true,
            placeholder: 'Buscar',
            button: '<span class="glyphicon glyphicon-search" aria-hidden="true"></span>',
            autosearch: true,
            class: ''
        },
        recordsPage: {
            active: true,
            rows: 10,
            next: 20,
            length: '5',
            class: ''
        },
        labelTotal: {
            active: true,
            showing: 'Mostrando',
            of: 'de',
            total: 'do total',
            loading: 'Carregando...',
            filtrate: 'Filtrado de',
            values_in_total: 'valores no total',
            records_not_found: 'Registros não encontrado',
            class: ''
        },
        pagination: {
            active: true,
            class: ''
        },
        orderDefault: []
    },
    _dsEmtName = {
        top: '_dsTop',
        bottom: '_dsBottom',
        search: '_dsSearch',
        records: '_dsRecords',
        pagination: '_dsPagination',
        totais: '_dsTotais'
    };

    var _randomID = function () {
        return '_dsDataTable_' + Math.random().toString(36).substr(2, 9);
    };

    var _mergeSettings = function (options) {
        return $.extend(true, {}, _dsSettings_default, options);
    };
    var _dsPaginationGet = function (_dsSettings) {
        var val;
        if ($("#" + _dsSettings.id + " [name='" + _dsEmtName.pagination + "']").length) {
            val = $("#" + _dsSettings.id + " [name='" + _dsEmtName.pagination + "']").find('.active').find('a').data("page");
        }
        return Number((isNaN(val)) ? 1 : val);
    };

    var _dsSerchGet = function (_dsSettings) {
        var val = '';
        if ($("#" + _dsSettings.id + " [name='" + _dsEmtName.search + "']").length) {
            val = $("#" + _dsSettings.id + " [name='" + _dsEmtName.search + "']").val();
        }
        return val;
    };

    var _dsRecordsGet = function (_dsSettings) {
        var val = _dsSettings.recordsPage.rows;
        if ($("#" + _dsSettings.id + " [name='" + _dsEmtName.records + "']").length) {
            val = $("#" + _dsSettings.id + " [name='" + _dsEmtName.records + "']").val();
        }
        return val;
    };

    var _dsAjax = function (_dsSettings) {
        var op = _dsSettings,
                dataAjax = {
                    dsRecordPages: _dsRecordsGet(_dsSettings),
                    dsSearch: _dsSerchGet(_dsSettings),
                    dsPageNow: _dsPaginationGet(_dsSettings),
                    dsOrder: _dsOrderColumnsGet(_dsSettings)
                },
        tbody,
        data = dataAjax;
        if(typeof op.ajax.addData !== 'undefined'){
            data = $.extend({}, dataAjax, op.ajax.addData);
        }
        jQuery.ajax({
            type: op.ajax.type,
            url: op.ajax.url,
            data: data,
            cache: false,
            dataType: "json",
            beforeSend: function () {
                _dsLabelTotal(_dsSettings, 1);
            },
            success: function (data) {
                if (typeof data.fields !== 'undefined') {
                    tbody = '';
                    $.each(data.fields, function (i, tr) {
                        tbody += '<tr>';
                        $.each(op.columns, function (i, td) {
                            var c = '';
                            if (typeof td.class !== 'undefined') {
                                c = 'class="' + td.class + '"';
                            }
                            tbody += '<td ' + c + '>' + tr[td.name] + '</td>';
                        });
                        tbody += '</tr>';
                    });
                    $(_dsSettings.element).find('tbody').html(tbody);

                    _dsPagination(_dsSettings, {total: Number(data.pages)});
                    _dsLabelTotal(_dsSettings, 2, {start: data.start, end: data.end, rows: data.rows, total_rows: data.total_rows});
                } else {
                    tbody = '<tr><td colspan="' + op.columns.length + '" align="center">' + op.labelTotal.records_not_found + '</td></tr>';
                    $(_dsSettings.element).find('tbody').html(tbody);
                    _dsPagination(_dsSettings, {total: 1});
                    _dsLabelTotal(_dsSettings, 3, {total_rows: data.total_rows});
                }
            }
        });
    };

    var _dsPagination = function (_dsSettings, pg) {
        if (!_dsSettings.pagination.active) {
            return false;
        }
        var op = _dsSettings.pagination,
                pNow = _dsPaginationGet(_dsSettings),
                pTot = pg.total,
                start = ((pNow - 2) < 1) ? 1 : pNow - 2,
                end,
                dsb_hBack = '',
                dsb_hNext = '';

        if ((start + 4) <= pTot) {
            end = start + 4;
        } else if ((start + 3) <= pTot) {
            end = start + 3;
            start = ((pNow - 3) < 1) ? 1 : pNow - 3;
        } else {
            end = pTot;
            start = ((pNow - 4) < 1) ? 1 : pNow - 4;
        }

        if (pNow === 1) {
            dsb_hBack = 'disabled';
        }
        if (pNow === pTot) {
            dsb_hNext = 'disabled';
        }

        var hStart = '<li><a href="javascript:;" data-page="1">1...</a></li>',
                hEnd = '<li><a href="javascript:;" data-page="' + pTot + '">...' + pTot + '</a></li>',
                hBack = '<li class="' + dsb_hBack + '"><a href="javascript:;" data-page="' + (pNow - 1) + '"><span aria-hidden="true">&laquo;</span></a></li>',
                hNext = '<li class="' + dsb_hNext + '"><a href="javascript:;" data-page="' + (pNow + 1) + '"><span aria-hidden="true">&raquo;</span></a></li>',
                hCtt = '',
                hNav = '',
                ih;


        for (var i = start; i <= end; i++) {
            var act = '';
            if (i === pNow) {
                act = 'active';
            }
            hCtt += '<li class="' + act + '"><a href="javascript:;" data-page="' + i + '">' + i + '</a></li>';
        }

        if (end <= (pTot - 1)) {
            hCtt += hEnd;
        }
        if (start >= 2) {
            hCtt = hStart + hCtt;
        }

        hNav = hBack + hCtt + hNext;
        ih = $("#" + _dsSettings.id + "  [name='" + _dsEmtName.pagination + "']").html(hNav);

        $(ih).find('li').click(function () {
            if ($(this).hasClass('active') || $(this).hasClass('disabled')) {
                return false;
            } else {
                $("#" + _dsSettings.id + " [name='" + _dsEmtName.pagination + "']").find('li').removeClass('active');
                $(this).addClass('active');
                _dsAjax(_dsSettings);
            }
        });
    };

    var _dsSearch = function (_dsSettings) {
        if (!_dsSettings.search.active) {
            return false;
        }
        var op = _dsSettings.search,
                h =
                '<div class="pull-right col-md-2 ' + op.class + '">' +
                '   <div class="form-group">' +
                '       <div class="input-group">' +
                '           <input type="text" class="form-control" name="' + _dsEmtName.search + '" placeholder="' + op.placeholder + '">' +
                '           <span class="input-group-btn">' +
                '               <button class="btn btn-default" type="button"> ' + op.button + ' </button>' +
                '           </span>' +
                '       </div>' +
                '   </div>' +
                '</div>',
                hi = $(h).appendTo("#" + _dsSettings.id + " [name='" + _dsEmtName.top + "']");

        $(hi).find('button').click(function () {
            _trigger_dsAjax(_dsSettings);
        });
        $(hi).find('input').keyup(function (e) {
            if (op.autosearch || e.which === 13) {
                _trigger_dsAjax(_dsSettings);
            }
        });
    };

    var _dsRecordPages = function (_dsSettings) {
        if (!_dsSettings.recordsPage.active) {
            return false;
        }
        var op = _dsSettings.recordsPage,
                option,
                h,
                ih;

        for (var i = 1; i < op.length; i++) {
            var value = (op.rows + (op.next * i));
            option += '<option value="' + value + '">' + value + '</option>';
        }

        h =
                '<div class="pull-left col-md-1 ' + op.class + '">' +
                '   <div class="form-group">' +
                '       <select name="' + _dsEmtName.records + '" class="form-control">' +
                '           <option value="' + op.rows + '">' + op.rows + '</option>' + option +
                '       </select>' +
                '   </div>' +
                '</div>',
                ih = $(h).appendTo("#" + _dsSettings.id + " [name='" + _dsEmtName.top + "']");

        $(ih).find("[name='" + _dsEmtName.records + "']").change(function () {
            _trigger_dsAjax(_dsSettings);
        });
    };

    /*
     * Type
     * Loading => 1
     * Totais => 2
     * Records not found => 3
     */
    var _dsLabelTotal = function (_dsSettings, type, page) {
        if (!_dsSettings.labelTotal.active) {
            return false;
        }
        var op = _dsSettings.labelTotal,
                html;
        if (type === 2) {
            html = op.showing + ' ' + (page.start + 1) + ' ' + op.of + ' ' + page.end + ' ' + op.total + ' ' + page.rows;
            if (page.rows !== page.total_rows) {
                html += ' - ' + op.filtrate + ' ' + page.total_rows + ' ' + op.values_in_total;
            }
            $("#" + _dsSettings.id + " [name='" + _dsEmtName.totais + "']").html(html);
        } else if (type === 3) {
            html = op.records_not_found;
            if (page.total_rows !== '0') {
                html += ' - ' + op.filtrate + ' ' + page.total_rows + ' ' + op.values_in_total;
            }
            $("#" + _dsSettings.id + " [name='" + _dsEmtName.totais + "']").html(html);
        } else if (type === 1) {
            $("#" + _dsSettings.id + " [name='" + _dsEmtName.totais + "']").html(op.loading);
        }
    };

    var _trigger_dsAjax = function (_dsSettings) {
        _dsPagination(_dsSettings, {total: 1});
        _dsAjax(_dsSettings);
    };

    var _dsOrderColumnsGet = function (_dsSettings) {
        var op = _dsSettings,
                order = [];
        $(_dsSettings.element).find('th').each(function (i, th) {
            if (typeof op.columns[i].order === 'undefined' || op.columns[i].order === true) {
                if ($(this).find('.arrow_order').hasClass('asc')) {
                    order.push({name: op.columns[i].name, order: 'asc'});
                } else if ($(this).find('.arrow_order').hasClass('desc')) {
                    order.push({name: op.columns[i].name, order: 'desc'});
                }
            }
        });
        return order;
    };

    var _dsOrderColumns = function (_dsSettings) {
        var op = _dsSettings,
                arrow = '<div class="arrow_order"><span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span> <span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span></div>';
        $(_dsSettings.element).find('th').each(function (i, th) {
            var _this = this;
            if (typeof op.columns[i].class !== 'undefined') {
                $(_this).addClass(op.columns[i].class);
            }
            if (typeof op.columns[i].order === 'undefined' || op.columns[i].order === true) {
                $(_this).append(arrow);
                
                if(typeof op.orderDefault !== 'undefined' &&  op.orderDefault.length){
                    $.each(op.orderDefault, function(ior, or){
                        if(op.columns[i].name === or.name){
                            $(_this).find('.arrow_order').addClass(or.order);
                        }
                    });
                }
                
                $(_this).click(function () {
                    if (!$(_this).find('.arrow_order').hasClass('asc') && !$(_this).find('.arrow_order').hasClass('desc')) {
                        $(_this).find('.arrow_order').addClass('asc');
                    } else if ($(_this).find('.arrow_order').hasClass('asc')) {
                        $(_this).find('.arrow_order').removeClass('asc');
                        $(_this).find('.arrow_order').addClass('desc');
                    } else if ($(_this).find('.arrow_order').hasClass('desc')) {
                        $(_this).find('.arrow_order').removeClass('desc');
                    }
                    _trigger_dsAjax(_dsSettings);
                });
            }
        });
    };

    var _dsCreateElements = function (_dsSettings) {
        var html = $(_dsSettings.element).wrap('<div class="_dsDataTable" id="' + _dsSettings.id + '"></div>'),
                bottom;
        $('<div class="row" name="' + _dsEmtName.top + '"></div>').insertBefore(html);
        bottom = $('<div class="row" name="' + _dsEmtName.bottom + '"></div>').insertAfter(html);

        $(bottom).append('<div class="pull-left col-md-12 ' + _dsSettings.labelTotal.class + '" name="' + _dsEmtName.totais + '"></div>');
        $(bottom).append('<div class="col-md-12 text-center ' + _dsSettings.pagination.class + '"><ul name="' + _dsEmtName.pagination + '" class="pagination"></ul></div>');

        if ($(_dsSettings.element).find('tbody').length === 0) {
            $(_dsSettings.element).append('<tbody></tbody>');
        }

    };

    var _dsDataTable = function (options) {
        var _dsSettings = _mergeSettings(options);

        _dsSettings.element = this;

        _dsSettings.id = _randomID();

        _dsCreateElements(_dsSettings);

        _dsOrderColumns(_dsSettings);

        _dsRecordPages(_dsSettings);

        _dsSearch(_dsSettings);

        _dsLabelTotal(_dsSettings, 1, null);

        _trigger_dsAjax(_dsSettings);

        return this;
    };

    jQuery.fn.dsDataTable = _dsDataTable;
})(jQuery);