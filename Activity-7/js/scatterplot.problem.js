function scatter_plot(
    data,
    ax,
    title = "",
    xCol = "",
    yCol = "",
    rCol = "",
    legend = [],
    colorCol = "",
    margin = 50
) {
    const X = data.map(d => d[xCol]);
    const Y = data.map(d => d[yCol]);
    const R = data.map(d => d[rCol]);
    const colorCategories = [...new Set(data.map(d => d[colorCol]))];
    const color = d3.scaleOrdinal()
        .domain(colorCategories)
        .range(d3.schemeTableau10);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(X))
        .range([margin, 1000 - margin]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(Y))
        .range([1000 - margin, margin]);

    const rScale = d3.scaleSqrt()
        .domain(d3.extent(R))
        .range([4, 12]);

    const Fig = d3.select(ax);

    Fig.selectAll('.markers')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${xScale(d[xCol])}, ${yScale(d[yCol])})`)
        .append('circle')
        .attr("class", d => `${d[colorCol]}`)
        .attr("r", d => rScale(d[rCol]))
        .attr("fill", d => color(d[colorCol]));

    const x_axis = d3.axisBottom(xScale).ticks(4);
    const y_axis = d3.axisLeft(yScale).ticks(4);

    Fig.append("g")
        .attr("transform", `translate(0,${1000 - margin})`)
        .call(x_axis);

    Fig.append("g")
        .attr("transform", `translate(${margin},0)`)
        .call(y_axis);

    Fig.append('text')
        .attr('x', 500)
        .attr('y', 40)
        .attr("text-anchor", "middle")
        .text(title)
        .attr("class", "title");

    const brush = d3.brush()
        .extent([[margin, margin], [1000 - margin, 1000 - margin]])
        .on("start", brushStart)
        .on("brush end", brushed);

    Fig.call(brush);

    function brushStart(event) {
        if (!event.selection) {
            d3.selectAll(".selected").classed("selected", false);
            updateSelectedList([]);
        }
    }

    function brushed(event) {
        const selection = event.selection;
        if (!selection || !selection[0] || !selection[1]) return;

        const [[x0, y0], [x1, y1]] = selection;

        const selectedData = data.filter(d => {
            if (!d[xCol] || !d[yCol]) return false;
            const x = xScale(d[xCol]);
            const y = yScale(d[yCol]);
            return x >= x0 && x <= x1 && y >= y0 && y <= y1;
        });

        d3.selectAll("circle").classed("selected", d => selectedData.includes(d));
        updateSelectedList(selectedData);
    }

    function updateSelectedList(selectedData) {
        const listBox = d3.select("#selected-list");
        listBox.selectAll("li").remove();

        listBox.selectAll("li")
            .data(selectedData)
            .enter()
            .append("li")
            .text(d => `${d.Model} - ${d.Type}`);
    }

    // Add Legend
    const legendContainer = Fig.append("g")
        .attr("transform", `translate(${800}, ${margin})`);

    if (legend.length === 0) legend = colorCategories;

    const legends = legendContainer.selectAll(".legend-item")
    .data(legend)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 25})`)
    .attr("class", "legend-item")
    .style("cursor", "pointer")
    .on("click", function (event, d) {
        const isActive = d3.select(this).classed("active");
        d3.select(this).classed("active", !isActive);

        d3.selectAll(`circle.${d}`)
            .transition()
            .style("opacity", isActive ? 1 : 0)
            .style("pointer-events", isActive ? "auto" : "none");
    });

legends.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => color(d))
    .attr("stroke", "black");

legends.append("text")
    .attr("x", 30)
    .attr("y", 15)
    .text(d => d) // Ensure the data bound to legend is displayed
    .attr("font-size", "14px")
    .attr("alignment-baseline", "middle")
    .style("fill", "black"); // Add color to ensure visibility
}
