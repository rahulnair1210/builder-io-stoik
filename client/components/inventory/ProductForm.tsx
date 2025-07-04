import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Package } from "lucide-react";
import { TShirt, SizeStock } from "@shared/types";

interface ProductFormProps {
  product?: TShirt;
  onSubmit: (data: Omit<TShirt, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const CATEGORIES = ["Casual", "Formal", "Sports", "Vintage", "Premium"];
const COLORS = [
  "Black",
  "White",
  "Gray",
  "Navy",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Pink",
  "Orange",
  "Brown",
];

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    design: product?.design || "",
    color: product?.color || "",
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    category: product?.category || "",
    tags: product?.tags || [],
  });

  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>(() => {
    if (product?.sizeStocks && product.sizeStocks.length > 0) {
      return product.sizeStocks;
    }
    // Default to one size if creating new product
    return [
      {
        size: "M" as const,
        stockLevel: 0,
        minStockLevel: 5,
      },
    ];
  });

  const [newTag, setNewTag] = useState("");

  // Available sizes (ones not already added)
  const availableSizes = SIZES.filter(
    (size) => !sizeStocks.some((ss) => ss.size === size),
  );

  const addSizeStock = (size: (typeof SIZES)[number]) => {
    setSizeStocks([
      ...sizeStocks,
      {
        size,
        stockLevel: 0,
        minStockLevel: 5,
      },
    ]);
  };

  const updateSizeStock = (
    index: number,
    field: keyof SizeStock,
    value: number | string,
  ) => {
    setSizeStocks(
      sizeStocks.map((ss, i) => (i === index ? { ...ss, [field]: value } : ss)),
    );
  };

  const removeSizeStock = (index: number) => {
    if (sizeStocks.length > 1) {
      setSizeStocks(sizeStocks.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (sizeStocks.length === 0) {
      alert("At least one size is required");
      return;
    }

    if (!formData.color) {
      alert("Color is required");
      return;
    }

    // Calculate total stock for backward compatibility
    const totalStock = sizeStocks.reduce((sum, ss) => sum + ss.stockLevel, 0);
    const avgMinStock = Math.round(
      sizeStocks.reduce((sum, ss) => sum + ss.minStockLevel, 0) /
        sizeStocks.length,
    );

    const productData = {
      ...formData,
      sizeStocks,
      // Backward compatibility fields
      stockLevel: totalStock,
      minStockLevel: avgMinStock,
      size: sizeStocks[0]?.size, // Default to first size
      photos: [],
    };

    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Premium Cotton T-Shirt"
                required
              />
            </div>

            <div>
              <Label htmlFor="design">Design</Label>
              <Input
                id="design"
                value={formData.design}
                onChange={(e) =>
                  setFormData({ ...formData, design: e.target.value })
                }
                placeholder="e.g., Minimalist Logo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="color">Color *</Label>
              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData({ ...formData, color: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sellingPrice">Selling Price</Label>
            <Input
              id="sellingPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPrice: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sizes and Stock */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sizes & Stock Levels</CardTitle>
            {availableSizes.length > 0 && (
              <Select onValueChange={(size) => addSizeStock(size as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Add Size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      Add {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sizeStocks.map((sizeStock, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm font-medium">
                    {sizeStock.size}
                  </Badge>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Stock Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeStock.stockLevel}
                      onChange={(e) =>
                        updateSizeStock(
                          index,
                          "stockLevel",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Min Stock Level</Label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeStock.minStockLevel}
                      onChange={(e) =>
                        updateSizeStock(
                          index,
                          "minStockLevel",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="h-8"
                    />
                  </div>
                </div>

                {sizeStocks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSizeStock(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {sizeStocks.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No sizes added yet</p>
                <p className="text-sm">Add at least one size to continue</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
