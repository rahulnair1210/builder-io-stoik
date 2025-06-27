import { useState, useCallback } from "react";
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
import { Customer } from "@shared/types";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (
    data: Omit<
      Customer,
      "id" | "createdAt" | "updatedAt" | "totalOrders" | "totalSpent"
    >,
  ) => void;
  onCancel: () => void;
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: {
      street: customer?.address?.street || "",
      city: customer?.address?.city || "",
      state: customer?.address?.state || "",
      zipCode: customer?.address?.zipCode || "",
      country: customer?.address?.country || "USA",
    },
    preferredContactMethod:
      customer?.preferredContactMethod || ("email" as const),
    notes: customer?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fixed input handlers to prevent typing issues
  const handleInputChange = useCallback((field: string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  }, []);

  const handleAddressChange = useCallback(
    (field: keyof typeof formData.address) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [field]: value,
          },
        }));
      };
    },
    [],
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Customer name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.street.trim())
      newErrors.street = "Street address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.state.trim()) newErrors.state = "State is required";
    if (!formData.address.zipCode.trim())
      newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange("name")}
              placeholder="John Smith"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              placeholder="+1-555-123-4567"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContact">Preferred Contact Method</Label>
          <Select
            value={formData.preferredContactMethod}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                preferredContactMethod: value as "email" | "phone" | "sms",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>

        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={formData.address.street}
            onChange={handleAddressChange("street")}
            placeholder="123 Main Street"
          />
          {errors.street && (
            <p className="text-sm text-destructive">{errors.street}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.address.city}
              onChange={handleAddressChange("city")}
              placeholder="New York"
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.address.state}
              onChange={handleAddressChange("state")}
              placeholder="NY"
            />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.address.zipCode}
              onChange={handleAddressChange("zipCode")}
              placeholder="10001"
            />
            {errors.zipCode && (
              <p className="text-sm text-destructive">{errors.zipCode}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={formData.address.country}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                address: { ...formData.address, country: value },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={handleInputChange("notes")}
          placeholder="Any additional notes about this customer..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {customer ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
