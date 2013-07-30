/*
 * Copyright (c) 2012 Memorial Sloan-Kettering Cancer Center.
 * This library is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation; either version 2.1 of the License, or
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  The software and
 * documentation provided hereunder is on an "as is" basis, and
 * Memorial Sloan-Kettering Cancer Center
 * has no obligations to provide maintenance, support,
 * updates, enhancements or modifications.  In no event shall
 * Memorial Sloan-Kettering Cancer Center
 * be liable to any party for direct, indirect, special,
 * incidental or consequential damages, including lost profits, arising
 * out of the use of this software and its documentation, even if
 * Memorial Sloan-Kettering Cancer Center
 * has been advised of the possibility of such damage.  See
 * the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, write to the Free Software Foundation,
 * Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA.
 */

var PlotsTwoGenesMenu = (function(){

    var content = {
            plots_type_list : {
                "mrna" : { value : "mrna", name :  "mRNA Expression" },
                "copy_no" : { value : "copy_no", name :  "Copy Number Alteration" },
                "methylation" : { value : "methylation", name :  "DNA Methylation" },
                "rppa" : { value : "rppa", name :  "RPPA Protein Level" }
            },
            genetic_profile_mutations : [],
            genetic_profile_mrna : [],
            genetic_profile_copy_no : [],
            genetic_profile_rppa : [],
            genetic_profile_dna_methylation : []
        };

    function generateList(selectId, options) {
        var select = document.getElementById(selectId);
        options.forEach(function(option){
            var el = document.createElement("option");
            el.textContent = option;
            el.value = option;
            select.appendChild(el);
        });
    }

    function fetchFrameData() {
        content.genetic_profile_mutations = Plots.getGeneticProfiles().genetic_profile_mutations;
        content.genetic_profile_mrna = Plots.getGeneticProfiles().genetic_profile_mrna;
        content.genetic_profile_copy_no = Plots.getGeneticProfiles().genetic_profile_copy_no;
        content.genetic_profile_dna_methylation = Plots.getGeneticProfiles().genetic_profile_dna_methylation;
        content.genetic_profile_rppa = Plots.getGeneticProfiles().genetic_profile_rppa;
    }

    function appendDropDown(divId, value, text) {
        $(divId).append("<option value='" + value + "'>" + text + "</option>");
    }

    function dataIsDiscretized(profileText) {
        if (profileText.indexOf("GISTIC") !== -1 ||
            profileText.indexOf("RAE") !== -1 ||
            profileText.indexOf("discretization") !== -1) {
            return true;
        }
        return false;
    }

    function setPlatFormDefaultSelection() {
        //----mRNA Priority List: RNA Seq V2, RNA Seq, Z-scores
        //TODO: Changed hard coded html value
        if ($("#two_genes_plots_type").val() === "mrna") {
            $("#two_genes_platform > option").each(function() {
                if (this.text.toLowerCase().indexOf("z-scores")){
                    $(this).prop('selected', true);
                    return false;
                }
            });
            $("#two_genes_platform > option").each(function() {
                if (this.text.toLowerCase().indexOf("rna seq") !== -1 &&
                    this.text.toLowerCase().indexOf("z-scores") === -1){
                    $(this).prop('selected', true);
                    return false;
                }
            });
            $("#two_genes_platform > option").each(function() {
                if (this.text.toLowerCase().indexOf("rna seq v2") !== -1 &&
                    this.text.toLowerCase().indexOf("z-scores") === -1){
                    $(this).prop('selected', true);
                    return false;
                }
            });
        }
    }

    function drawPlatFormList() {
        $("#two_genes_platform_select_div").empty();
        $("#two_genes_platform_select_div").append(
            "<select id='two_genes_platform' onchange='PlotsTwoGenesView.init();' class='plots-select'>");

        if ($("#two_genes_plots_type").val() === "mrna") {
            content.genetic_profile_mrna.forEach (function (profile) {
                $("#two_genes_platform")
                    .append("<option value='" + profile[0] + "'>" + profile[1] + "</option>");
            });
            setPlatFormDefaultSelection();
        } else if ($("#two_genes_plots_type").val() === "copy_no") {
            content.genetic_profile_copy_no.forEach (function (profile) {
                if (!dataIsDiscretized(profile[1])) {
                    $("#two_genes_platform")
                        .append("<option value='" + profile[0] + "'>" + profile[1] + "</option>");
                }
            });
        } else if ($("#two_genes_plots_type").val() === "methylation") {
            content.genetic_profile_dna_methylation.forEach (function (profile) {
                $("#two_genes_platform")
                    .append("<option value='" + profile[0] + "'>" + profile[1] + "</option>");
            });
        } else if ($("#two_genes_plots_type").val() === "rppa") {
            content.genetic_profile_rppa.forEach (function (profile) {
                $("#two_genes_platform")
                    .append("<option value='" + profile[0] + "'>" + profile[1] + "</option>");
            });
        }
        $("#two_genes_platform_select_div").append("</select>");
    }

    function generatePlotsTypeList() {
        appendDropDown("#two_genes_plots_type", content.plots_type_list.mrna.value, content.plots_type_list.mrna.name);
        if (content.genetic_profile_copy_no.length !== 0) {
            var _flag = false;
            $.each(content.genetic_profile_copy_no, function(index, val) {
                if (!dataIsDiscretized(val[1])) {
                    _flag = true;
                }
            });     //If contains continuous data type
            if (_flag) {
                appendDropDown("#two_genes_plots_type", content.plots_type_list.copy_no.value, content.plots_type_list.copy_no.name);
            }
        }
        if (content.genetic_profile_dna_methylation.length !== 0) {
            appendDropDown("#two_genes_plots_type", content.plots_type_list.methylation.value, content.plots_type_list.methylation.name);
        }
        if (content.genetic_profile_rppa.length !== 0) {
            appendDropDown("#two_genes_plots_type", content.plots_type_list.rppa.value, content.plots_type_list.rppa.name);
        }
    }

    function generateGeneList() {
        //TODO: Enable this view only when there are >2 genes!
        //TODO: Always make sure these are two different genes
        generateList("geneX", gene_list);
        //shift the genelist (temporary solution)
        var tmp_gene_list = jQuery.extend(true, [], gene_list);
        var tmp_gene_holder = tmp_gene_list.pop();
        tmp_gene_list.unshift(tmp_gene_holder);
        generateList("geneY", tmp_gene_list);
    }

    return {
        init: function() {
            fetchFrameData();
            generateGeneList();
            generatePlotsTypeList();
        },
        update: function() {
            drawPlatFormList();
        }
    };
}());      //Closing PlotsTwoGenesMenu

var PlotsTwoGenesView = (function(){

    //Extracted data from JSON for plotting
    //Dots collection
    var pData = {
            case_set_length : 0,
            dotsData : []
        },
    //Data Set Status (empty)
        errStatus = {
            xHasData : false,
            yHasData : false
        },
    //Current Selection from the menu
        menu = {
            geneX : "",
            geneY : "",
            plots_type: "",
            genetic_profile_id: ""
        },
    //Canvas Settings
        settings = {
            canvas_width: 720,
            canvas_height: 600
        },
    //DOMs
        elem = {
            svg : "",
            xScale : "",
            yScale : "",
            xAxis : "",
            yAxis : "",
            dotsGroup : ""   //Group of single Dots
        },
    //The template for creating dot unit
        singleDot = {
            case_id : "",
            x_value : "",
            y_value : "",
            annotation: ""  //Mutation (for now)
        },
        style = {
            geneX_mut : {
                fill : "#DBA901",
                stroke : "#886A08",
                text : "GeneX Mutated"
            },
            geneY_mut : {
                fill : "#F5A9F2",
                stroke : "#F7819F",
                text : "GeneY Mutated"
            },
            both_mut : {
                fill : "#FF0000",
                stroke : "#B40404",
                text : "Both Mutated"
            },
            non_mut : {
                fill : "#00AAF8",
                stroke : "#0089C6",
                text : "Neither Mutated"
            }
        };

    function isEmpty(inputVal) {
        if (inputVal !== "NaN" && inputVal !== "NA") {
            return false;
        }
        return true;
    }

    function getUserSelection() {
        menu.geneX = document.getElementById("geneX").value;
        menu.geneY = document.getElementById("geneY").value;
        menu.plots_type = document.getElementById("two_genes_plots_type").value;
        menu.genetic_profile_id = document.getElementById("two_genes_platform").value;
    }

    function pDataInit(result) {
        var tmp_singleDot = {
            case_id : "",
            value: "",
            annotation: ""
        };
        var tmp_pDataX = [];
        var tmp_pDataY = [];
        pData.dotsData.length = 0;
        pData.case_set_length = 0;
        for (var gene in result) {
            if (gene === menu.geneX) {
                var geneObj = result[gene];
                for (var case_id in geneObj) {
                    var obj = geneObj[case_id];
                    var new_tmp_singleDot = jQuery.extend(true, {}, tmp_singleDot);
                    new_tmp_singleDot.case_id = case_id;
                    new_tmp_singleDot.value = obj[Object.keys(obj)[0]]; //profile id
                    if (obj.hasOwnProperty(Object.keys(obj)[1])) { //mutation
                        new_tmp_singleDot.annotation = obj[Object.keys(obj)[1]];
                    } else {
                        new_tmp_singleDot.annotation = "NaN";
                    }
                    tmp_pDataX.push(new_tmp_singleDot);
                }
            } else if (gene === menu.geneY) {
                var geneObj = result[gene];
                for (var case_id in geneObj) {
                    var obj = geneObj[case_id];
                    var new_tmp_singleDot = jQuery.extend(true, {}, tmp_singleDot);
                    new_tmp_singleDot.case_id = case_id;
                    new_tmp_singleDot.value = obj[Object.keys(obj)[0]]; //profile id
                    if (obj.hasOwnProperty(Object.keys(obj)[1])) { //mutation
                        new_tmp_singleDot.annotation = obj[Object.keys(obj)[1]];
                    } else {
                        new_tmp_singleDot.annotation = "NaN";
                    }
                    tmp_pDataY.push(new_tmp_singleDot);
                }
            }
        }

        //Handle same gene situation:
        //In this case, the two axis should get
        //exactly the same value set
        if (menu.geneX === menu.geneY) {
            tmp_pDataY = tmp_pDataX;
        }

        //Error Handle: spot empty dataset
        errStatus.xHasData = false;
        errStatus.yHasData = false;
        $.each(tmp_pDataX, function(key, obj) {
            if (!isEmpty(obj.value)) {
                errStatus.xHasData = true;
            }
        });
        $.each(tmp_pDataY, function(key, obj) {
            if (!isEmpty(obj.value)) {
                errStatus.yHasData = true;
            }
        });

        //merge tmp_pDataX, tmp_pDataY, and filter empty data
        for (var i = 0; i < tmp_pDataY.length; i++) {
            if (!isEmpty(tmp_pDataX[i].value) && !isEmpty(tmp_pDataY[i].value)) {

                pData.case_set_length += 1;

                var new_singleDot = jQuery.extend(true, {}, singleDot);
                new_singleDot.case_id = tmp_pDataX[i].case_id;
                new_singleDot.x_value = tmp_pDataX[i].value;
                new_singleDot.y_value = tmp_pDataY[i].value;
                //Mutation: process single/multi gene mutation
                var tmp_annotation_str = "";
                if (!isEmpty(tmp_pDataX[i].annotation)) {
                    tmp_annotation_str +=
                        menu.geneX + ": " + tmp_pDataX[i].annotation + "&nbsp;&nbsp;";
                }
                if (!isEmpty(tmp_pDataY[i].annotation)) {
                    tmp_annotation_str +=
                        menu.geneY + ": " + tmp_pDataY[i].annotation;
                }

                if (menu.geneX === menu.geneY) {
                    tmp_annotation_str = tmp_annotation_str.substring(0, tmp_annotation_str.length/2);
                }

                new_singleDot.annotation = tmp_annotation_str.trim();
                pData.dotsData.push(new_singleDot);
            }
        }
    }

    function analyseData() {    //pDataX, pDataY: array of single dot objects
        var tmp_xData = [];
        var tmp_xIndex = 0;
        var tmp_yData = [];
        var tmp_yIndex = 0;
        for (var j = 0; j< pData.case_set_length; j++){
            if (!isEmpty(pData.dotsData[j].x_value) && !isEmpty(pData.dotsData[j].y_value)) {
                tmp_xData[tmp_xIndex] = pData.dotsData[j].x_value;
                tmp_xIndex += 1;
                tmp_yData[tmp_yIndex] = pData.dotsData[j].y_value;
                tmp_yIndex += 1;
            }
        }
        var min_x = Math.min.apply(Math, tmp_xData);
        var max_x = Math.max.apply(Math, tmp_xData);
        var edge_x = (max_x - min_x) * 0.2;
        var min_y = Math.min.apply(Math, tmp_yData);
        var max_y = Math.max.apply(Math, tmp_yData);
        var edge_y = (max_y - min_y) * 0.1;
        return {
            min_x: min_x,
            max_x: max_x,
            edge_x: edge_x,
            min_y: min_y,
            max_y: max_y,
            edge_y: edge_y
        };
    }

    function initCanvas() {
        $('#plots_box').empty();
        elem.svg = d3.select("#plots_box")
            .append("svg")
            .attr("width", settings.canvas_width)
            .attr("height", settings.canvas_height);
        elem.dotsGroup = elem.svg.append("svg:g");
    }

    function initAxis() {
        var analyseResult = analyseData();
        var min_x = analyseResult.min_x;
        var max_x = analyseResult.max_x;
        var edge_x = analyseResult.edge_x;
        var min_y = analyseResult.min_y;
        var max_y = analyseResult.max_y;
        var edge_y = analyseResult.edge_y;

        ///TODO: Hide html value "methylation"
        ///funciton() datatypeIsMethylation
        if (menu.plots_type === "methylation") { //Fix the range for methylation data
            var rangeXmin = -0.02;
            var rangeXmax = 1.02;
            var rangeYmin = -0.02;
            var rangeYmax = 1.02;
        } else {
            var rangeXmin = min_x - edge_x;
            var rangeXmax = max_x + edge_x;
            var rangeYmin = min_y - edge_y;
            var rangeYmax = max_y + edge_y;
        }

        elem.xScale = d3.scale.linear()
            .domain([rangeXmin, rangeXmax])
            .range([100, 600]);
        elem.yScale = d3.scale.linear()
            .domain([rangeYmin, rangeYmax])
            .range([520, 20]);

        elem.xAxis = d3.svg.axis()
            .scale(elem.xScale)
            .orient("bottom")
        elem.yAxis = d3.svg.axis()
            .scale(elem.yScale)
            .orient("left");
    }

    function drawAxis() {
        var svg = elem.svg;
        svg.append("g")
            .style("stroke-width", 2)
            .style("fill", "none")
            .style("stroke", "grey")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(0, 520)")
            .attr("class", "plots-x-axis-class")
            .call(elem.xAxis)
            .selectAll("text")
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .style("fill", "black");
        svg.append("g")
            .style("stroke-width", 2)
            .style("fill", "none")
            .style("stroke", "grey")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(0, 20)")
            .call(elem.xAxis.orient("bottom").ticks(0));
        svg.append("g")
            .style("stroke-width", 2)
            .style("fill", "none")
            .style("stroke", "grey")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(100, 0)")
            .attr("class", "plots-y-axis-class")
            .call(elem.yAxis)
            .selectAll("text")
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .style("stroke-width", 0.5)
            .style("stroke", "black")
            .style("fill", "black");
        svg.append("g")
            .style("stroke-width", 2)
            .style("fill", "none")
            .style("stroke", "grey")
            .style("shape-rendering", "crispEdges")
            .attr("transform", "translate(600, 0)")
            .call(elem.yAxis.orient("left").ticks(0));
    }

    function drawErrorMsg() {
        $('#view_title').empty();
        elem.svg.empty();

        var _line1 = "";
        var _line2 = " in the selected cancer study.";
        if (!errStatus.xHasData && errStatus.yHasData) {
            _line1 = "There is no " + $("#two_genes_platform option:selected").html() + " data for";
            _line2 = menu.geneX + _line2;
        } else if (!errStatus.yHasData && errStatus.xHasData) {
            _line1 = "There is no " + $("#two_genes_platform option:selected").html() + " data for";
            _line2 = menu.geneY + _line2;
        } else if (!errStatus.yHasData && !errStatus.xHasData) {
            _line1 = "There is no " + $("#two_genes_platform option:selected").html() + " data for ";
            if (menu.geneX === menu.geneY) {
                _line2 = menu.geneX + _line2;
            } else {
                _line2 = menu.geneX + ", " + menu.geneY + _line2;
            }
        }

        elem.svg.append("text")
            .attr("x", 350)
            .attr("y", 55)
            .attr("text-anchor", "middle")
            .attr("fill", "#DF3A01")
            .text(_line1)
        elem.svg.append("text")
            .attr("x", 350)
            .attr("y", 70)
            .attr("text-anchor", "middle")
            .attr("fill", "#DF3A01")
            .text(_line2)
        elem.svg.append("rect")
            .attr("x", 150)
            .attr("y", 30)
            .attr("width", 400)
            .attr("height", 60)
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke", "#BDBDBD");
    }

    function drawPlots() {
        //sort DotsData
        var tmp_dotsData = pData.dotsData;
        var nonMutatedData = [];
        var mutatedData= [];
        var dataBuffer = [];
        tmp_dotsData.forEach (function(entry) {
            if (entry.annotation !== "") {
                mutatedData.push(entry);
            } else {
                nonMutatedData.push(entry);
            }
        });
        nonMutatedData.forEach (function(entry) {
            dataBuffer.push(entry);
        });
        mutatedData.forEach (function(entry) {
            dataBuffer.push(entry);
        });
        tmp_dotsData = dataBuffer;

        elem.dotsGroup.selectAll("path").remove();
        var showMutation = document.getElementById("show_mutation").checked;
        elem.dotsGroup.selectAll("path")
            .data(tmp_dotsData)
            .enter()
            .append("svg:path")
            .attr("transform", function(d){
                return "translate(" + elem.xScale(d.x_value) + ", " + elem.yScale(d.y_value) + ")";
            })
            .attr("d", d3.svg.symbol()
                .size(20)
                .type("circle"))
            .attr("fill", function(d) {
                if (showMutation) {
                    if (d.annotation === "") {
                        return style.non_mut.fill;
                    } else {
                        var count = d.annotation.split(":").length - 1;
                        if (count === 1) { //single mut
                            if (d.annotation.indexOf(menu.geneX) !== -1) {
                                return style.geneX_mut.fill;
                            } else if (d.annotation.indexOf(menu.geneY) !== -1) {
                                return style.geneY_mut.fill;
                            }
                        } else if (count === 2) { //both mut
                            return style.both_mut.fill;
                        }
                    }
                } else {
                    return style.non_mut.fill;
                }
            })
            .attr("stroke", function(d) {
                if (showMutation) {
                    if (d.annotation === "") {
                        return style.non_mut.stroke;
                    } else {
                        var count = d.annotation.split(":").length - 1;
                        if (count === 1) { //single mut
                            if (d.annotation.indexOf(menu.geneX) !== -1) {
                                return style.geneX_mut.stroke;
                            } else if (d.annotation.indexOf(menu.geneY) !== -1) {
                                return style.geneY_mut.stroke;
                            }
                        } else if (count === 2) { //both mut
                            return style.both_mut.stroke;
                        }
                    }
                } else {
                    return style.non_mut.stroke;
                }
            })
            .attr("stroke-width", function(d) {
                return "1.2";
            });
    }

    function drawLegends() {
        var showMutation = document.getElementById("show_mutation").checked;
        if (showMutation) {
            var twoGenesStyleArr = [];
            for (var key in style) {
                var obj = style[key];
                twoGenesStyleArr.push(obj);
            }

            //Only show glyphs "mutated" and "non mutated" for same gene situation
            //TODO: separate same gene situation into different functions
            if (menu.geneX === menu.geneY) {
                twoGenesStyleArr.splice(1, 1);
                twoGenesStyleArr.splice(1, 1);
            }

            var legend = elem.svg.selectAll(".legend")
                .data(twoGenesStyleArr)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(610, " + (30 + i * 15) + ")";
                })

            legend.append("path")
                .attr("width", 18)
                .attr("height", 18)
                .attr("d", d3.svg.symbol()
                    .size(30)
                    .type(function(d) { return "circle"; }))
                .attr("fill", function (d) { return d.fill; })
                .attr("stroke", function (d) { return d.stroke; })
                .attr("stroke-width", 1.1);

            legend.append("text")
                .attr("dx", ".75em")
                .attr("dy", ".35em")
                .style("text-anchor", "front")
                .text(function(d) {
                    if (d.text.indexOf("GeneX") !== -1) {
                        var tmp_legend = d.text.replace("GeneX", menu.geneX);
                    } else if (d.text.indexOf("GeneY") !== -1) {
                        var tmp_legend = d.text.replace("GeneY", menu.geneY);
                    } else {
                        var tmp_legend = d.text;
                    }
                    return tmp_legend;
                });
        } else {
            var legend = elem.svg.selectAll("g.legend").remove();
        }
    }

    function drawImgConverter() {
        $('#view_title').empty();
        var elt = document.getElementById("two_genes_plots_type");
        var titleText = elt.options[elt.selectedIndex].text;
        $('#view_title').append(titleText + ": " + menu.geneX + " vs. " + menu.geneY);

        var pdfConverterForm = "<form style='display:inline-block' action='svgtopdf.do' method='post' " +
            "onsubmit=\"this.elements['svgelement'].value=loadSVG();\">" +
            "<input type='hidden' name='svgelement'>" +
            "<input type='hidden' name='filetype' value='pdf'>" +
            "<input type='hidden' name='filename' value='plots.pdf'>" +
            "<input type='submit' value='PDF'></form>";
        $('#view_title').append(pdfConverterForm);

        var svgConverterForm = "<form style='display:inline-block' action='svgtopdf.do' method='post' " +
            "onsubmit=\"this.elements['svgelement'].value=loadSVG();\">" +
            "<input type='hidden' name='svgelement'>" +
            "<input type='hidden' name='filetype' value='svg'>" +
            "<input type='hidden' name='filename' value='plots.svg'>" +
            "<input type='submit' value='SVG'></form>";
        $('#view_title').append(svgConverterForm);
    }

    function drawAxisTitle() {
        var elt = document.getElementById("two_genes_platform");
        var titleText = elt.options[elt.selectedIndex].text;
        var xTitle =
            menu.geneX + ", " + titleText;
        var yTitle =
            menu.geneY + ", " + titleText;
        var axisTitleGroup = elem.svg.append("svg:g");
        axisTitleGroup.append("text")
            .attr("class", "label")
            .attr("x", 350)
            .attr("y", 580)
            .style("text-anchor", "middle")
            .style("font-weight","bold")
            .text(xTitle);
        axisTitleGroup.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -270)
            .attr("y", 45)
            .style("text-anchor", "middle")
            .style("font-weight","bold")
            .text(yTitle);
    }

    function addQtips() {
        elem.dotsGroup.selectAll('path').each(
            function(d) {
                var content = "<font size='2'>";
                content += "Case ID: " + "<strong><a href='tumormap.do?case_id=" + d.case_id +
                    "&cancer_study_id=" + cancer_study_id + "'>" + d.case_id + "</a></strong><br>";
                content += menu.geneX + ": <strong>" + parseFloat(d.x_value).toFixed(3) + "</strong><br>" +
                    menu.geneY + ": <strong>" + parseFloat(d.y_value).toFixed(3) + "</strong><br>";
                if (d.annotation !== "") {
                    if (menu.geneX === menu.geneY) {
                        var tmp_anno_str = d.annotation.substring(d.annotation.indexOf(":") + 1, d.annotation.length);
                    } else {
                        var tmp_anno_str = d.annotation;
                    }
                    content += "Mutation: <strong>" + tmp_anno_str + "</strong>";
                }
                content = content + "</font>";

                $(this).qtip(
                    {
                        content: {text: content},
                        style: { classes: 'ui-tooltip-light ui-tooltip-rounded ui-tooltip-shadow ui-tooltip-lightyellow' },
                        hide: { fixed:true, delay: 100},
                        position: {my:'left bottom',at:'top right'}
                    }
                );

                var mouseOn = function() {
                    var dot = d3.select(this);
                    dot.transition()
                        .ease("elastic")
                        .duration(600)
                        .delay(100)
                        .attr("d", d3.svg.symbol().size(200).type("circle"));
                };

                var mouseOff = function() {
                    var dot = d3.select(this);
                    dot.transition()
                        .ease("elastic")//TODO: default d3 symbol is circle (coincidence!)
                        .duration(600)
                        .delay(100)
                        .attr("d", d3.svg.symbol().size(20).type("circle"));
                };
                elem.dotsGroup.selectAll("path").on("mouseover", mouseOn);
                elem.dotsGroup.selectAll("path").on("mouseout", mouseOff);
            }
        );
    }

    function updateMutationDisplay() {
        drawPlots();
        drawLegends();
        addQtips();
    }

    function generatePlots() {
        getProfileData();
    }

    function getProfileData() {
        Plots.getProfileData(
            menu.geneX + " " + menu.geneY,
            menu.genetic_profile_id + " " + cancer_study_id + "_mutations",
            case_set_id,
            case_ids_key,
            getProfileDataCallBack
        );
    }

    function getProfileDataCallBack(result) {
        pDataInit(result);
        initCanvas();
        if (pData.dotsData.length !== 0) {
            $("#show_mutation").attr("disabled", false);
            initAxis();
            drawAxis();
            drawPlots();
            drawLegends();
            drawAxisTitle();
            addQtips();
            drawImgConverter();
        } else {
            $("#show_mutation").attr("disabled", true);
            drawErrorMsg();
        }
    }

    return {
        init : function() {
            $('#view_title').empty();
            $('#plots_box').empty();
            $('#loading-image').show();
            $('#view_title').hide();
            $('#plots_box').hide();

            getUserSelection();
            //Contains a series of chained function
            //Including data fetching and drawing
            generatePlots();

            setTimeout(
                function() {
                    $('#view_title').show();
                    $('#plots_box').show();
                    $('#loading-image').hide();
                },
                500
            );
        },
        update : function() {
            //TODO: use cache
        },
        updateMutationDisplay : updateMutationDisplay
    };
}());     //Closing PlotsTwoGeneView