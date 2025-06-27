import { useState } from "react";
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
import { X } from "lucide-react";
import { TShirt } from "@shared/types";

interface ProductFormProps {
  product?: TShirt;
  onSubmit: (data: Omit<TShirt, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
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
    size: product?.size || ("" as TShirt["size"]),
    color: product?.color || "",
    stockLevel: product?.stockLevel || 0,
    minStockLevel: product?.minStockLevel || 5,
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    category: product?.category || "",
    tags: product?.tags || [],
    photos: product?.photos || [],
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.design.trim()) newErrors.design = "Design is required";
    if (!formData.size) newErrors.size = "Size is required";
    if (!formData.color.trim()) newErrors.color = "Color is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.costPrice <= 0)
      newErrors.costPrice = "Cost price must be greater than 0";
    if (formData.sellingPrice <= 0)
      newErrors.sellingPrice = "Selling price must be greater than 0";
    if (formData.sellingPrice <= formData.costPrice)
      newErrors.sellingPrice = "Selling price must be greater than cost price";
    if (formData.stockLevel < 0)
      newErrors.stockLevel = "Stock level cannot be negative";
    if (formData.minStockLevel < 0)
      newErrors.minStockLevel = "Minimum stock level cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as Omit<TShirt, "id" | "createdAt" | "updatedAt">);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Classic Cotton Tee"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="design">Design</Label>
          <Input
            id="design"
            value={formData.design}
            onChange={(e) =>
              setFormData({ ...formData, design: e.target.value })
            }
            placeholder="e.g., Vintage Logo"
          />
          {errors.design && (
            <p className="text-sm text-destructive">{errors.design}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select
            value={formData.size}
            onValueChange={(value) =>
              setFormData({ ...formData, size: value as TShirt["size"] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.size && (
            <p className="text-sm text-destructive">{errors.size}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
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
          {errors.color && (
            <p className="text-sm text-destructive">{errors.color}</p>
          )}
        </div>

        <div className="space-y-2">
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
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockLevel">Current Stock</Label>
          <Input
            id="stockLevel"
            type="number"
            min="0"
            value={formData.stockLevel}
            onChange={(e) =>
              setFormData({ ...formData, stockLevel: parseInt(e.target.value) })
            }
          />
          {errors.stockLevel && (
            <p className="text-sm text-destructive">{errors.stockLevel}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
          <Input
            id="minStockLevel"
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={(e) =>
              setFormData({
                ...formData,
                minStockLevel: parseInt(e.target.value),
              })
            }
          />
          {errors.minStockLevel && (
            <p className="text-sm text-destructive">{errors.minStockLevel}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price ($)</Label>
          <Input
            id="costPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                costPrice: parseFloat(e.target.value),
              })
            }
          />
          {errors.costPrice && (
            <p className="text-sm text-destructive">{errors.costPrice}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price ($)</Label>
          <Input
            id="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                sellingPrice: parseFloat(e.target.value),
              })
            }
          />
          {errors.sellingPrice && (
            <p className="text-sm text-destructive">{errors.sellingPrice}</p>
          )}
          {formData.costPrice > 0 && formData.sellingPrice > 0 && (
            <p className="text-sm text-slate-600">
              Profit per unit: $
              {(formData.sellingPrice - formData.costPrice).toFixed(2)} (
              {(
                ((formData.sellingPrice - formData.costPrice) /
                  formData.costPrice) *
                100
              ).toFixed(1)}
              % margin)
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center">
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
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
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
