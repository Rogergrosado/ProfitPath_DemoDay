import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { category: "Electronics", revenue: 24580, growth: 12 },
  { category: "Health & Fitness", revenue: 18920, growth: 8 },
  { category: "Home & Garden", revenue: 15670, growth: -3 },
  { category: "Sports", revenue: 12450, growth: 15 },
  { category: "Automotive", revenue: 8920, growth: 5 },
];

export function CategoryBreakdownChart() {
  return (
    <Card className="bg-[hsl(240,10%,13%)] border-[hsl(240,3.7%,15.9%)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Revenue by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="category"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="hsl(20, 90%, 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
