import { useEffect, useMemo, useState } from "react";
import "./EventEditor.css";

const templates = [
  { id: "editorial", name: "Editorial", description: "Clean premium" },
  { id: "midnight", name: "Midnight", description: "Bold & modern" },
  { id: "festival", name: "Festival", description: "Bright energy" },
  { id: "minimal", name: "Minimal", description: "Simple & elegant" },
  { id: "concert", name: "Concert", description: "Music style" },
  { id: "corporate", name: "Corporate", description: "Professional" },
  { id: "social", name: "Social", description: "Trendy" },
  { id: "luxury", name: "Luxury", description: "Premium look" },
];

const themes = [
  "#713528",
  "#182033",
  "#B83B5E",
  "#246B5A",
  "#6A4C93",
  "#C56A24",
  "#1E5A88",
  "#222222",
];

const fonts = [
  { id: "modern", name: "Modern", value: "Arial, sans-serif" },
  { id: "serif", name: "Elegant", value: "Georgia, serif" },
  { id: "mono", name: "Mono", value: "monospace" },
  { id: "classic", name: "Classic", value: "Times New Roman, serif" },
];

const filters = [
  { id: "none", name: "Original" },
  { id: "soft", name: "Soft" },
  { id: "contrast", name: "Contrast" },
  { id: "warm", name: "Warm" },
  { id: "cool", name: "Cool" },
  { id: "vintage", name: "Vintage" },
  { id: "rose", name: "Rose" },
  { id: "sunset", name: "Sunset" },
  { id: "ocean", name: "Ocean" },
  { id: "noir", name: "Noir" },
  { id: "dreamy", name: "Dreamy" },
];

const categories = [
  "Music",
  "Sports",
  "Technology",
  "Education",
  "Business",
  "Workshop",
  "Festival",
  "Other",
];

function EventEditor({ event, onBack, onSaved }) {
  const editing = Boolean(event);

  const getLoggedInUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const loggedInUser = getLoggedInUser();

  const [title, setTitle] = useState(event?.title || "");
  const [date, setDate] = useState(event?.date || "");
  const [location, setLocation] = useState(event?.location || "");
  const [category, setCategory] = useState(event?.category || "Music");
  const [description, setDescription] = useState(event?.description || "");

  const [template, setTemplate] = useState(
    event?.posterTemplate || "editorial"
  );

  const [theme, setTheme] = useState(
    event?.accentColor || "#713528"
  );

  const [font, setFont] = useState(
    event?.posterFont || "modern"
  );

  const [filter, setFilter] = useState(
    event?.posterFilter || "none"
  );

  const [textAlign, setTextAlign] = useState(
    event?.posterTextAlign || "left"
  );

  const [posterTitle, setPosterTitle] = useState(
    event?.posterTitle || event?.title || ""
  );

  const [posterSubtitle, setPosterSubtitle] = useState(
    event?.posterSubtitle || "AN EVENT BY EVENTHUB"
  );

  const [posterDescription, setPosterDescription] = useState(
    event?.posterDescription || event?.description || ""
  );

  const [badge, setBadge] = useState(
    event?.posterBadge || "EVENTHUB"
  );

  const [contactNumber, setContactNumber] = useState(
    event?.posterContact || ""
  );

  const [contactEmail, setContactEmail] = useState(
    event?.posterEmail || ""
  );

  const [contactAddress, setContactAddress] = useState(
    event?.posterAddress || ""
  );

  const [website, setWebsite] = useState(
    event?.posterWebsite || ""
  );

  const [customTexts, setCustomTexts] = useState(
    Array.isArray(event?.posterCustomTexts)
      ? event.posterCustomTexts
      : []
  );

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editing) {
      setPosterTitle(title);
    }
  }, [title, editing]);

  const selectedFont = useMemo(
    () => fonts.find((item) => item.id === font) || fonts[0],
    [font]
  );

  const templateClass = `poster poster-${template} filter-${filter}`;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setMessage("");

    if (
      !title.trim() ||
      !date ||
      !location.trim() ||
      !category ||
      !description.trim()
    ) {
      setMessage("Please fill all event details.");
      return;
    }

    if (!loggedInUser?.id) {
      setMessage("Please login again.");
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      date,
      location: location.trim(),
      category,
      description: description.trim(),
      createdBy: loggedInUser.id,

      posterTemplate: template,
      posterTheme: "custom",
      posterLayout: "classic",
      posterFont: font,

      posterTitle: posterTitle.trim(),
      posterSubtitle: posterSubtitle.trim(),
      posterDescription: posterDescription.trim(),

      posterTextAlign: textAlign,
      posterFilter: filter,
      posterBadge: badge.trim(),

      posterContact: contactNumber.trim(),
      posterEmail: contactEmail.trim(),
      posterAddress: contactAddress.trim(),
      posterWebsite: website.trim(),
      posterCustomTexts: customTexts
        .filter((item) => item?.text?.trim())
        .map((item) => ({
          text: item.text.trim(),
          position: item.position || "middle",
          fontSize: Number(item.fontSize) || 18,
          align: item.align || "left",
        })),

      accentColor: theme,
    };

    try {
      const url = editing
        ? `http://localhost:5000/api/events/${event._id}`
        : "http://localhost:5000/api/events";

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message || "Event save nahi hua.");
        return;
      }

      setMessage(
        editing
          ? "Event updated successfully."
          : "Event published successfully."
      );

      setTimeout(() => {
        if (onSaved) {
          onSaved(data);
        }
      }, 500);
    } catch (error) {
      console.error(error);
      setMessage("Server se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  const addCustomText = () => {
    setCustomTexts((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        text: "",
        position: "middle",
        fontSize: 18,
        align: "left",
      },
    ]);
  };

  const updateCustomText = (index, field, value) => {
    setCustomTexts((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeCustomText = (index) => {
    setCustomTexts((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const getCustomTextPosition = (position) => {
    const positions = {
      top: "24%",
      middle: "48%",
      bottom: "72%",
    };

    return positions[position] || positions.middle;
  };

  const downloadPoster = () => {
    const safeTitle = (posterTitle || title || "event")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    const safeFont = selectedFont.value.includes(" ")
      ? "Arial"
      : selectedFont.value;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900">

        <rect width="700" height="900" fill="#FFFDFB" />

        <rect
          x="35"
          y="35"
          width="630"
          height="830"
          rx="28"
          fill="#FFFDFB"
          stroke="${theme}"
          stroke-width="4"
        />

        <text
          x="70"
          y="95"
          font-family="Arial"
          font-size="20"
          font-weight="700"
          fill="${theme}"
        >
          ${escapeXml(badge)}
        </text>

        <text
          x="70"
          y="190"
          font-family="${escapeXml(safeFont)}"
          font-size="52"
          font-weight="700"
          fill="#171312"
        >
          ${escapeXml(posterTitle || title)}
        </text>

        <text
          x="70"
          y="240"
          font-family="Arial"
          font-size="20"
          fill="${theme}"
        >
          ${escapeXml(posterSubtitle)}
        </text>

        <line
          x1="70"
          y1="275"
          x2="630"
          y2="275"
          stroke="${theme}"
          stroke-width="2"
        />

        <text
          x="70"
          y="335"
          font-family="Arial"
          font-size="22"
          fill="#171312"
        >
          ${escapeXml(date)}
        </text>

        <text
          x="70"
          y="380"
          font-family="Arial"
          font-size="22"
          fill="#171312"
        >
          ${escapeXml(location)}
        </text>

        <text
          x="70"
          y="450"
          font-family="Arial"
          font-size="19"
          fill="#625a57"
        >
          ${escapeXml(
            (posterDescription || description).slice(0, 100)
          )}
        </text>

        ${customTexts
          .filter((item) => item?.text?.trim())
          .map((item, index) => {
            const yMap = {
              top: 145,
              middle: 500 + index * 30,
              bottom: 690 + index * 30,
            };

            const y = yMap[item.position] || yMap.middle;
            const x =
              item.align === "center"
                ? 350
                : item.align === "right"
                ? 630
                : 70;
            const anchor =
              item.align === "center"
                ? "middle"
                : item.align === "right"
                ? "end"
                : "start";

            return `
              <text
                x="${x}"
                y="${y}"
                text-anchor="${anchor}"
                font-family="Arial"
                font-size="${Math.min(
                  Math.max(Number(item.fontSize) || 18, 10),
                  42
                )}"
                font-weight="600"
                fill="${theme}"
              >
                ${escapeXml(item.text)}
              </text>
            `;
          })
          .join("")}

        <text
          x="70"
          y="770"
          font-family="Arial"
          font-size="16"
          fill="#625a57"
        >
          ${escapeXml(
            [contactNumber, contactEmail, contactAddress]
              .filter(Boolean)
              .join("  •  ")
          )}
        </text>

        <text
          x="70"
          y="810"
          font-family="Arial"
          font-size="18"
          font-weight="700"
          fill="${theme}"
        >
          ${escapeXml(category)}
        </text>

        <text
          x="70"
          y="835"
          font-family="Arial"
          font-size="14"
          fill="#817672"
        >
          ${escapeXml(website || "EVENTHUB")}
        </text>

      </svg>
    `;

    const blob = new Blob([svg], {
      type: "image/svg+xml",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${safeTitle}-poster.svg`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="event-editor-page">

      <header className="editor-header">

        <button
          type="button"
          className="editor-back"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="editor-title">
          <span>EVENTHUB STUDIO</span>
          <h1>
            {editing
              ? "Edit your event"
              : "Create your event"}
          </h1>
        </div>

        <button
          type="button"
          className="save-top"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : editing
            ? "Update Event"
            : "Publish Event"}
        </button>

      </header>

      <main className="editor-layout">

        <section className="editor-panel">

          {/* EVENT DETAILS */}

          <div className="studio-section">

            <div className="panel-heading">

              <span>01</span>

              <div>
                <h2>Event Details</h2>
                <p>
                  Tell people what your event is about.
                </p>
              </div>

            </div>

            <div className="editor-fields">

              <label>
                Event Name

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Summer Music Night"
                />
              </label>

              <div className="two-fields">

                <label>
                  Date

                  <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                  />
                </label>

                <label>
                  Category

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                  >
                    {categories.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

              </div>

              <label>
                Location

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Event location"
                />
              </label>

              <label>
                Description

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe your event..."
                  rows={4}
                />
              </label>

            </div>

          </div>

          {/* POSTER DESIGN */}

          <div className="studio-section">

            <div className="panel-heading">

              <span>02</span>

              <div>
                <h2>Poster Design</h2>

                <p>
                  Design your event poster while you edit.
                </p>
              </div>

            </div>

            {/* TEMPLATE */}

            <div className="control-section">

              <div className="control-heading">

                <h3>Choose Template</h3>

                <span>
                  {templates.length} styles
                </span>

              </div>

              <div className="template-grid">

                {templates.map((item) => (

                  <button
                    type="button"
                    key={item.id}
                    className={
                      template === item.id
                        ? "template-card active"
                        : "template-card"
                    }
                    onClick={() =>
                      setTemplate(item.id)
                    }
                  >

                    <div
                      className={`mini-poster poster-${item.id}`}
                      style={{
                        "--accent": theme,
                      }}
                    >
                      <span>
                        {item.name.toUpperCase()}
                      </span>
                    </div>

                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {item.description}
                    </small>

                  </button>

                ))}

              </div>

            </div>

            {/* ACCENT COLOUR */}

            <div className="control-section">

              <div className="control-heading">

                <h3>Accent Colour</h3>

                <span>
                  Highlights
                </span>

              </div>

              <div className="color-row">

                {themes.map((color) => (

                  <button
                    type="button"
                    key={color}
                    aria-label={`Accent ${color}`}
                    className={
                      theme === color
                        ? "color-option selected"
                        : "color-option"
                    }
                    style={{
                      backgroundColor: color,
                    }}
                    onClick={() =>
                      setTheme(color)
                    }
                  >
                    {theme === color
                      ? "✓"
                      : ""}
                  </button>

                ))}

              </div>

            </div>

            {/* FONT */}

            <div className="control-section">

              <div className="control-heading">

                <h3>Font</h3>

                <span>
                  Typography
                </span>

              </div>

              <div className="font-grid">

                {fonts.map((item) => (

                  <button
                    type="button"
                    key={item.id}
                    className={
                      font === item.id
                        ? "font-option active"
                        : "font-option"
                    }
                    style={{
                      fontFamily: item.value,
                    }}
                    onClick={() =>
                      setFont(item.id)
                    }
                  >
                    {item.name}
                  </button>

                ))}

              </div>

            </div>

            {/* TEXT ALIGNMENT */}

            <div className="control-section">

              <div className="control-heading">

                <h3>Text Alignment</h3>

              </div>

              <div className="choice-grid three">

                {[
                  "left",
                  "center",
                  "right",
                ].map((item) => (

                  <button
                    type="button"
                    key={item}
                    className={
                      textAlign === item
                        ? "choice-option active"
                        : "choice-option"
                    }
                    onClick={() =>
                      setTextAlign(item)
                    }
                  >
                    {item
                      .charAt(0)
                      .toUpperCase() +
                      item.slice(1)}
                  </button>

                ))}

              </div>

            </div>

            {/* FILTER */}

            <div className="control-section">

              <div className="control-heading">

                <h3>Poster Filter</h3>

                <span>
                  Colour effects
                </span>

              </div>

              <div className="choice-grid">

                {filters.map((item) => (

                  <button
                    type="button"
                    key={item.id}
                    className={
                      filter === item.id
                        ? "choice-option active"
                        : "choice-option"
                    }
                    onClick={() =>
                      setFilter(item.id)
                    }
                  >
                    {item.name}
                  </button>

                ))}

              </div>

            </div>

            {/* POSTER TEXT */}

            <div className="control-section">

              <div className="control-heading">

                <h3>Poster Text</h3>

                <span>
                  Optional
                </span>

              </div>

              <label>
                Poster Title

                <input
                  value={posterTitle}
                  onChange={(e) =>
                    setPosterTitle(e.target.value)
                  }
                  placeholder="Poster headline"
                />
              </label>

              <label>
                Subtitle

                <input
                  value={posterSubtitle}
                  onChange={(e) =>
                    setPosterSubtitle(e.target.value)
                  }
                  placeholder="Short subtitle"
                />
              </label>

              <label>
                Badge

                <input
                  value={badge}
                  onChange={(e) =>
                    setBadge(e.target.value)
                  }
                  placeholder="EVENTHUB"
                />
              </label>

              <label>
                Poster Description

                <textarea
                  value={posterDescription}
                  onChange={(e) =>
                    setPosterDescription(e.target.value)
                  }
                  rows={3}
                  placeholder="Short poster description"
                />
              </label>

            </div>

            {/* CONTACT INFORMATION */}

            <div className="control-section">

              <div className="control-heading">
                <h3>Contact Information</h3>
                <span>Optional</span>
              </div>

              <div className="two-fields">

                <label>
                  Contact Number

                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) =>
                      setContactNumber(e.target.value)
                    }
                    placeholder="e.g. +91 98765 43210"
                  />
                </label>

                <label>
                  Email

                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) =>
                      setContactEmail(e.target.value)
                    }
                    placeholder="e.g. hello@example.com"
                  />
                </label>

              </div>

              <label>
                Address

                <input
                  value={contactAddress}
                  onChange={(e) =>
                    setContactAddress(e.target.value)
                  }
                  placeholder="Venue address or organizer address"
                />
              </label>

              <label>
                Website / Registration Link

                <input
                  type="url"
                  value={website}
                  onChange={(e) =>
                    setWebsite(e.target.value)
                  }
                  placeholder="https://example.com/register"
                />
              </label>

            </div>

            {/* CUSTOM TEXT */}

            <div className="control-section">

              <div className="control-heading">
                <div>
                  <h3>Add Custom Text</h3>
                  <span>
                    Add extra information anywhere on your poster
                  </span>
                </div>

                <button
                  type="button"
                  className="choice-option active"
                  onClick={addCustomText}
                  style={{
                    minWidth: "120px",
                    borderRadius: "999px",
                  }}
                >
                  + Add Text
                </button>
              </div>

              {customTexts.length === 0 ? (
                <div
                  style={{
                    padding: "18px",
                    border: "1px dashed rgba(113, 53, 40, 0.25)",
                    borderRadius: "14px",
                    background: "#fffaf6",
                    color: "#817672",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  Add things like “FREE ENTRY”, “Chief Guest”,
                  “Limited Seats” or any other information.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                  }}
                >
                  {customTexts.map((item, index) => (
                    <div
                      key={item.id || index}
                      style={{
                        padding: "16px",
                        border: "1px solid rgba(113, 53, 40, 0.14)",
                        borderRadius: "16px",
                        background: "#fffdfb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <strong>
                          Custom Text {index + 1}
                        </strong>

                        <button
                          type="button"
                          onClick={() => removeCustomText(index)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#9a3f32",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <label>
                        Text

                        <input
                          value={item.text}
                          onChange={(e) =>
                            updateCustomText(
                              index,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder="e.g. FREE ENTRY"
                        />
                      </label>

                      <div className="two-fields">
                        <label>
                          Position

                          <select
                            value={item.position || "middle"}
                            onChange={(e) =>
                              updateCustomText(
                                index,
                                "position",
                                e.target.value
                              )
                            }
                          >
                            <option value="top">Top</option>
                            <option value="middle">
                              Middle
                            </option>
                            <option value="bottom">
                              Bottom
                            </option>
                          </select>
                        </label>

                        <label>
                          Font Size

                          <select
                            value={item.fontSize || 18}
                            onChange={(e) =>
                              updateCustomText(
                                index,
                                "fontSize",
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value="14">Small</option>
                            <option value="18">Medium</option>
                            <option value="24">Large</option>
                            <option value="32">Extra Large</option>
                          </select>
                        </label>
                      </div>

                      <label>
                        Alignment

                        <select
                          value={item.align || "left"}
                          onChange={(e) =>
                            updateCustomText(
                              index,
                              "align",
                              e.target.value
                            )
                          }
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </section>

        {/* PREVIEW */}

        <section className="preview-panel">

          <div className="preview-header">

            <div>
              <span>LIVE PREVIEW</span>
              <h2>Your poster</h2>
            </div>

            <button
              type="button"
              onClick={downloadPoster}
              className="download-button"
            >
              ↓ Download
            </button>

          </div>

          <div className="poster-stage">

            <div
              id="event-poster-preview"
              className={templateClass}
              style={{
                "--accent": theme,
                "--poster-text": "#171312",
                fontFamily: selectedFont.value,
                textAlign,
              }}
            >

              <div className="poster-decoration" />

              <div className="poster-inner">

                <span className="poster-badge">
                  {badge || "EVENTHUB"}
                </span>

                <span className="poster-category">
                  {category}
                </span>

                <h1>
                  {posterTitle ||
                    title ||
                    "Your Event"}
                </h1>

                <h3>
                  {posterSubtitle ||
                    "Your event starts here"}
                </h3>

                <p>
                  {posterDescription ||
                    description ||
                    "Your event description will appear here."}
                </p>

                <div className="poster-info">

                  <div>
                    <small>DATE</small>

                    <strong>
                      {date || "Add date"}
                    </strong>
                  </div>

                  <div>
                    <small>LOCATION</small>

                    <strong>
                      {location || "Add location"}
                    </strong>
                  </div>

                </div>

                <div
                  className="poster-custom-texts"
                  style={{
                    display: "grid",
                    gap: "8px",
                    margin: "22px 0",
                  }}
                >
                  {customTexts
                    .filter((item) => item?.text?.trim())
                    .map((item, index) => (
                      <div
                        key={item.id || index}
                        style={{
                          fontSize: `${Math.min(
                            Math.max(Number(item.fontSize) || 18, 10),
                            42
                          )}px`,
                          fontWeight: 700,
                          color: theme,
                          textAlign: item.align || "left",
                          order:
                            item.position === "top"
                              ? 0
                              : item.position === "bottom"
                              ? 2
                              : 1,
                        }}
                      >
                        {item.text}
                      </div>
                    ))}
                </div>

                {(contactNumber ||
                  contactEmail ||
                  contactAddress ||
                  website) && (
                  <div
                    className="poster-contact"
                    style={{
                      marginTop: "14px",
                      display: "grid",
                      gap: "5px",
                      color: "#625a57",
                      fontSize: "13px",
                      lineHeight: 1.45,
                    }}
                  >
                    {contactNumber && (
                      <div>📞 {contactNumber}</div>
                    )}

                    {contactEmail && (
                      <div>✉ {contactEmail}</div>
                    )}

                    {contactAddress && (
                      <div>📍 {contactAddress}</div>
                    )}

                    {website && (
                      <div>🔗 {website}</div>
                    )}
                  </div>
                )}

                <div className="poster-footer">
                  EVENTHUB
                </div>

              </div>

            </div>

          </div>

          <div className="preview-actions">

            <button
              type="button"
              className="preview-publish"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editing
                ? "Update Event"
                : "Publish Event"}
            </button>

            <span>
              Changes appear instantly in the poster preview.
            </span>

          </div>

        </section>

      </main>

      {message && (
        <div className="editor-toast">
          {message}
        </div>
      )}

    </div>
  );
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default EventEditor;