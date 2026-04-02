"use client";

import { ActivityCalendar } from "react-activity-calendar";
import { HeatmapItem } from "@/lib/api";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface ActivityHeatmapProps {
    data: HeatmapItem[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Generate a full year of data for 2025 to ensure the calendar looks complete
    const fullYearData = (() => {
        const year = 2025;
        const days = [];
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);

        // Create a map for quick lookup
        const dataMap = new Map(data.map(item => [item.date, item.count]));

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const count = dataMap.get(dateStr) || 0;

            // Manual level calculation since auto-calc seems flaky with sparse data or this version
            // Scale: 0 -> 0, 1-2 -> 1, 3-5 -> 2, 6-10 -> 3, >10 -> 4
            let level = 0;
            if (count > 0) level = 1;
            if (count >= 3) level = 2;
            if (count >= 6) level = 3;
            if (count >= 10) level = 4;

            // Or just standard ceiling if we had more varied data
            // if (count > 0) level = Math.ceil(count / 5); 
            // if (level > 4) level = 4;

            days.push({
                date: dateStr,
                count: count,
                level: level
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    })();

    // Custom levels for colors
    const theme = {
        light: ['#e2e8f0', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
        dark: ['#334155', '#1e293b', '#3b82f6', '#1d4ed8', '#1e3a8a'],
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <ActivityCalendar
                data={fullYearData}
                theme={theme}
                labels={{
                    legend: {
                        less: 'Less',
                        more: 'More',
                    },
                    months: [
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ],
                    totalCount: '{{count}} publications in 2025',
                    weekdays: [
                        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
                    ]
                }}
                showWeekdayLabels
                renderBlock={(block, activity) => (
                    <div data-tooltip-id="react-tooltip" data-tooltip-content={`${activity.count} publications on ${activity.date}`}>
                        {block}
                    </div>
                )}
            />
            <ReactTooltip id="react-tooltip" />
        </div>
    );
}
