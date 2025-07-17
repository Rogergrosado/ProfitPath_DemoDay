import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Electronics", value: 35, color: "#fd7014" },
  { name: "Health & Fitness", value: 25, color: "#3b82f6" },
  { name: "Home & Garden", value: 20, color: "#10b981" },
  { name: "Sports", value: 20, color: "#f59e0b" },
];

export function SalesByCategoryChart() {
  return (
    <Card className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
              <Legend
                wrapperStyle={{ color: "#ffffff" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
