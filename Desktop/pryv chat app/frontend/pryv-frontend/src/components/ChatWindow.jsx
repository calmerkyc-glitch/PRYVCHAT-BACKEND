import { useState, useEffect, useContext, useMemo, useRef } from "react";
import API from "../utils/api.js";
import { initSocket, disconnectSocket } from "../utils/socket.js";
import useMediaQuery from "../hooks/useMediaQuery.jsx";
import ContactsList from "./ContactsList.jsx";
import UserDiscovery from "./UserDiscovery.jsx";
import ChatHeader from "./ChatHeader.jsx";
import MessageBubble from "./MessageBubble.jsx";
import Button from "./Button.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import ProfilePreview from "./ProfilePreview.jsx";
import SettingsCard from "./SettingsCard.jsx";
import ExpandablePanel from "./ExpandablePanel.jsx";
import SectionSidebar from "./SectionSidebar.jsx";
import FormField from "./FormField.jsx";
import ToggleField from "./ToggleField.jsx";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (value) => {
  if (!value) return "â€”";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFriendlyDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const groupMessagesByDate = (messages) =>
  messages.reduce((groups, message) => {
    const dateKey = new Date(message.createdAt).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(message);
    return groups;
  }, {});

export default function ChatWindow() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeView, setActiveView] = useState("chats");
  const [contactsSubView, setContactsSubView] = useState("list");
  const [mobileMode, setMobileMode] = useState("list");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [lastReadMap, setLastReadMap] = useState({});
  const [onlineStatus, setOnlineStatus] = useState({});
  const [profilePicture, setProfilePicture] = useState(user?.user?.profilePicture || "");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    location: "",
    pronouns: "",
    website: "",
    twitter: "",
  });
  const [privacyForm, setPrivacyForm] = useState({
    showOnlineStatus: true,
    showProfile: true,
    discoverable: true,
  });
  const [accountForm, setAccountForm] = useState({ email: "", phone: "" });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [unblocking, setUnblocking] = useState(false);
  const [otpEnabled, setOtpEnabled] = useState(false);
  const fileInputRef = useRef(null);
  const [openSection, setOpenSection] = useState("profile");
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  const userTag = user?.user?.tag;
  const userName = user?.user?.name;
  const deletedChatTags = user?.user?.deletedChats || [];
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (!userTag) return;
    const saved = localStorage.getItem(`pryv_last_read_${userTag}`);
    setLastReadMap(saved ? JSON.parse(saved) : {});
  }, [userTag]);

  const updateLastRead = (contactTag, timestamp) => {
    if (!userTag || !contactTag) return;
    const next = { ...lastReadMap, [contactTag]: timestamp };
    setLastReadMap(next);
    localStorage.setItem(`pryv_last_read_${userTag}`, JSON.stringify(next));
  };

  useEffect(() => {
    setProfilePicture(user?.user?.profilePicture || "");
  }, [user?.user?.profilePicture]);

  useEffect(() => {
    setProfileForm({
      name: user?.user?.name || "",
      bio: user?.user?.bio || "",
      location: user?.user?.location || "",
      pronouns: user?.user?.pronouns || "",
      website: user?.user?.website || "",
      twitter: user?.user?.twitter || "",
    });
    setPrivacyForm({
      showOnlineStatus: user?.user?.showOnlineStatus ?? true,
      showProfile: user?.user?.showProfile ?? true,
      discoverable: user?.user?.discoverable ?? true,
    });
    setAccountForm({
      email: user?.user?.email || "",
      phone: user?.user?.phone || "",
    });
  }, [user?.user]);

  useEffect(() => {
    if (!user?.token) return;
    const refresh = async () => {
      try {
        const res = await API.get("/auth/me");
        updateUser(res.data);
      } catch (err) {
        console.error("Failed to refresh profile:", err);
      }
    };
    refresh();
  }, [user?.token, updateUser]);

  useEffect(() => {
    if (!user?.token) return;
    const fetchBlocked = async () => {
      try {
        const res = await API.get("/auth/blocked-users");
        setBlockedUsers(res.data || []);
      } catch (err) {
        console.error("Failed to load blocked users:", err);
      }
    };
    fetchBlocked();
  }, [user?.token]);

  const handleProfileFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a JPG or PNG image.");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setProfileError("Please select JPG or PNG format only.");
      return;
    }

    setProfileError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageBase64 = reader.result;
      setUploadingProfile(true);
      try {
        const res = await API.post("/auth/profile-picture", {
          imageBase64,
          fileName: file.name,
        });
        setProfilePicture(res.data.profilePicture);
        updateUser({ profilePicture: res.data.profilePicture });
      } catch (err) {
        console.error("Profile upload failed:", err);
        setProfileError(err.response?.data?.error || "Unable to upload profile picture.");
      } finally {
        setUploadingProfile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerProfileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCopyHandle = async () => {
    if (!user?.user?.tag) return;
    try {
      await navigator.clipboard.writeText(user.user.tag);
      setSuccessMessage("Profile handle copied.");
    } catch (err) {
      console.error("Copy failed:", err);
      setProfileError("Unable to copy handle.");
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await API.post("/auth/update-profile", profileForm);
      updateUser(res.data);
      setSuccessMessage("Personal info updated.");
    } catch (err) {
      console.error("Save profile failed:", err);
      setProfileError(err.response?.data?.error || "Failed to save profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    setProfileError(null);
    try {
      const res = await API.post("/auth/update-privacy", privacyForm);
      updateUser(res.data);
      setSuccessMessage("Privacy settings saved.");
    } catch (err) {
      console.error("Save privacy failed:", err);
      setProfileError(err.response?.data?.error || "Failed to save privacy settings.");
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    setProfileError(null);
    try {
      const res = await API.post("/auth/update-account", accountForm);
      updateUser(res.data);
      setSuccessMessage("Account settings saved.");
    } catch (err) {
      console.error("Save account failed:", err);
      setProfileError(err.response?.data?.error || "Failed to save account info.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    try {
      await API.post("/auth/logout-other-sessions");
      setSuccessMessage("Logged out of other devices.");
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.error || "Failed to log out other sessions.");
    }
  };

  const handleUnblock = async (tag) => {
    setUnblocking(true);
    setProfileError(null);
    try {
      await API.post(`/auth/unblock/${tag}`);
      setBlockedUsers((prev) => prev.filter((item) => item.tag !== tag));
      setSuccessMessage(`${tag} has been unblocked.`);
    } catch (err) {
      console.error("Unblock failed:", err);
      setProfileError(err.response?.data?.error || "Failed to unblock user.");
    } finally {
      setUnblocking(false);
    }
  };

  const createClientId = () => `${userTag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const [notifications, setNotifications] = useState([]);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [processingTag, setProcessingTag] = useState(null);

  const addNotification = (message, variant = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 5000);
  };

  const respondToRequest = async (requesterTag, action) => {
    if (!requesterTag || !action) {
      addNotification('Unable to process request: missing user or action.', 'warning');
      return null;
    }

    setProcessingTag(requesterTag);
    try {
      console.log(`Responding to request from ${requesterTag} with action: ${action}`);
      const res = await API.post(`/auth/respond-request/${encodeURIComponent(requesterTag)}`, { action });
      
      if (res.status === 200 && (res.data.status === 'accepted' || res.data.status === 'declined')) {
        // Remove from pending received
        setPendingReceived((prev) => prev.filter((p) => p.tag !== requesterTag));
        
        // If accepted, add to contacts
        if (action === 'accept' && res.data.contact) {
          setContacts((prev) => (prev.some((c) => c.tag === res.data.contact.tag) ? prev : [res.data.contact, ...prev]));
        }
        
        console.log(`Request ${action} succeeded for ${requesterTag}`);
        setProcessingTag(null);
        return res;
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      const backendError = err.response?.data?.error;
      const errorMessage = backendError || err.message || `Failed to ${action} request.`;
      console.error(`Request ${action} failed for ${requesterTag}:`, { status: err.response?.status, error: err.response?.data, message: err.message });
      addNotification(errorMessage, 'warning');
      setProcessingTag(null);
      return null;
    }
  };

  const handleAcceptRequest = async () => {
    if (!incomingRequest) return;
    setProcessingTag(incomingRequest.tag);
    const res = await respondToRequest(incomingRequest.tag, 'accept');
    if (res) {
      addNotification('You are now connected. You can start chatting.', 'success');
      setIncomingRequest(null);
    }
    setProcessingTag(null);
  };

  const handleDeclineRequest = async () => {
    if (!incomingRequest) return;
    setProcessingTag(incomingRequest.tag);
    const res = await respondToRequest(incomingRequest.tag, 'decline');
    if (res) {
      addNotification('You declined the request.', 'info');
      setIncomingRequest(null);
    }
    setProcessingTag(null);
  };

  const handleContactAdded = (contact) => {
    setContacts((prev) => {
      if (prev.some((c) => c.tag === contact.tag)) return prev;
      return [contact, ...prev];
    });
    addNotification(`You added ${contact.name || contact.tag} to your contacts.`);
  };

  const openConversation = (contactOrTag) => {
    if (!contactOrTag) return;
    const contact = typeof contactOrTag === "string"
      ? contacts.find((c) => c.tag === contactOrTag)
      : contactOrTag;

    if (contact && !deletedChatTags.includes(contact.tag) && !contacts.some((c) => c.tag === contact.tag)) {
      setContacts((prev) => [contact, ...prev]);
    }

    const tag = typeof contactOrTag === "string" ? contactOrTag : contactOrTag.tag;
    setSelectedTag(tag);
    setActiveView("chats");
    setContactsSubView("list");
    setMobileMode("conversation");
    updateLastRead(tag, new Date().toISOString());
    markMessagesSeen(tag);
  };

  const markMessagesSeen = (contactTag) => {
    if (!socket || !userTag || !contactTag) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (
          msg.senderTag === contactTag &&
          msg.receiverTag === userTag &&
          msg.status !== "seen"
        ) {
          return { ...msg, status: "seen", seenAt: new Date().toISOString() };
        }
        return msg;
      })
    );

    socket.emit("markMessagesSeen", {
      senderTag: contactTag,
      receiverTag: userTag,
    });
  };

  useEffect(() => {
    if (!userTag) return;

    const fetchData = async () => {
      try {
        const [contactsRes, messagesRes] = await Promise.all([
          API.get("/auth/contacts"),
          API.get(`/chat/messages/${encodeURIComponent(userTag)}`),
        ]);

        const activeContacts = (contactsRes.data || []).filter((contact) => !deletedChatTags.includes(contact.tag));
        setContacts(activeContacts);
        setMessages(messagesRes.data);

        if (!selectedTag && activeContacts.length > 0) {
          setSelectedTag(activeContacts[0].tag);
        }
      } catch (err) {
        console.error("Failed to load chat data", err);
      }
    };

    fetchData();
    // fetch pending requests
    (async () => {
      try {
        const res = await API.get('/auth/pending-requests');
        setPendingSent(res.data.sent || []);
        setPendingReceived(res.data.received || []);
      } catch (err) {
        console.error('Failed to load pending requests', err);
      }
    })();
  }, [userTag]);

  useEffect(() => {
    if (!userTag) return;

    const client = initSocket();
    setSocket(client);
    client.emit("registerUser", userTag);

    client.on("presenceState", (onlineTags) => {
      const nextStatus = {};
      (onlineTags || []).forEach((tag) => {
        nextStatus[tag] = true;
      });
      setOnlineStatus(nextStatus);
    });

    client.on("presenceUpdate", ({ tag, online }) => {
      setOnlineStatus((prev) => ({ ...prev, [tag]: online }));
    });

    client.on("receiveMessage", (msg) => {
      if (msg.receiverTag === userTag || msg.senderTag === userTag) {
        setMessages((prev) => {
          if (msg.clientId) {
            const existingIndex = prev.findIndex(
              (existing) => existing.clientId && existing.clientId === msg.clientId
            );
            if (existingIndex !== -1) {
              const next = [...prev];
              next[existingIndex] = msg;
              return next;
            }
          }
          return [...prev, msg];
        });
      }
    });

    client.on("contactAdded", ({ from }) => {
      if (!from?.tag) return;
      setContacts((prev) => {
        if (prev.some((c) => c.tag === from.tag)) return prev;
        return [from, ...prev];
      });
      addNotification(`${from.name || from.tag} added you as a contact.`);
    });

    client.on("typing", ({ from }) => {
      if (!from?.tag) return;
      setTypingUser({ tag: from.tag, label: from.name || from.tag });
      try {
        if (typeof typingTimeoutRef !== "undefined" && typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
        }
        if (typeof typingTimeoutRef !== "undefined") {
          typingTimeoutRef.current = window.setTimeout(() => setTypingUser(null), 3000);
        }
      } catch (e) {
        console.warn('typing timeout error', e);
      }
    });

    client.on("stopTyping", ({ from }) => {
      if (!from?.tag) return;
      setTypingUser((current) => (current?.tag === from.tag ? null : current));
    });

    client.on("incomingContactRequest", ({ from }) => {
      if (!from) return;
      setIncomingRequest(from);
      addNotification(`${from.name || from.tag} has added you.`, "info");
      setPendingReceived((prev) => {
        if (prev.some((p) => p.tag === from.tag)) return prev;
        return [from, ...prev];
      });
    });

    client.on("requestSent", ({ to }) => {
      if (!to) return;
      addNotification(`Request sent to ${to.name || to.tag}.`, "info");
    });

    client.on("contactRequestDeclined", ({ by }) => {
      addNotification(`Your request was turned down.`, "info");
    });

    client.on('notification', ({ message, type, from }) => {
      if (message) addNotification(message, type === 'success' ? 'success' : 'info');
    });

    client.on("blockedBy", ({ by }) => {
      addNotification(`You cannot send messages â€” you are blocked by ${by}.`, "warning");
    });

    client.on("youWereUnblocked", ({ from }) => {
      if (!from) return;
      addNotification(`This user has unblocked you: ${from.name || from.tag}`);
    });

    client.on("youWereBlocked", ({ by }) => {
      addNotification(`You were blocked by ${by}. You can no longer see their status.`, "warning");
    });

    client.on("messageStatusUpdated", ({ messageIds, status }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            messageIds?.includes(msg._id?.toString()) ||
            messageIds?.includes(msg.clientId)
          ) {
            return { ...msg, status, seenAt: new Date().toISOString() };
          }
          return msg;
        })
      );
    });

    return () => {
      try {
        if (typeof typingTimeoutRef !== "undefined" && typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
        }
      } catch (e) {
        console.warn('cleanup typing timeout error', e);
      }
      disconnectSocket(client);
    };
  }, [userTag]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return contacts
      .filter((contact) => !deletedChatTags.includes(contact.tag))
      .map((contact) => {
        const contactMessages = messages.filter(
          (msg) =>
            (msg.senderTag === contact.tag && msg.receiverTag === userTag) ||
            (msg.senderTag === userTag && msg.receiverTag === contact.tag)
        );

        const lastMessage = contactMessages.length > 0 ? contactMessages[contactMessages.length - 1] : null;
        const unreadCount = contactMessages.filter(
          (msg) =>
            msg.senderTag === contact.tag &&
            msg.receiverTag === userTag &&
            msg.status !== "seen"
        ).length;

        const selectedButNotViewed = contact.tag === selectedTag && unreadCount > 0 && !(mobileMode === "conversation" || isDesktop);

        return {
          ...contact,
          lastMessage: lastMessage?.content || "Start a new conversation",
          lastMessageTime: lastMessage?.createdAt,
          unreadCount,
          isOnline: onlineStatus[contact.tag] || false,
          selectedButNotViewed,
        };
      })
      .filter((contact) => {
        if (!normalizedSearch) return true;
        return (
          contact.name?.toLowerCase().includes(normalizedSearch) ||
          contact.tag?.toLowerCase().includes(normalizedSearch) ||
          contact.lastMessage?.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return bTime - aTime;
      });
  }, [contacts, messages, search, userTag, selectedTag, mobileMode, isDesktop, onlineStatus]);

  useEffect(() => {
    if (!selectedTag && filteredContacts.length > 0) {
      setSelectedTag(filteredContacts[0].tag);
    }
  }, [filteredContacts, selectedTag]);

  useEffect(() => {
    if (!selectedTag || !socket || !userTag) return;
    const hasUnread = messages.some(
      (msg) =>
        msg.senderTag === selectedTag &&
        msg.receiverTag === userTag &&
        msg.status !== "seen"
    );
    if (!hasUnread) return;

    // Only mark messages as seen when the conversation is actually visible to the user.
    // On mobile this means `mobileMode === 'conversation'`. On desktop (lg and up)
    // the chat panel is visible by default, so allow mark as seen when window width
    // is at or above the lg breakpoint (1024px). This prevents messages being
    // marked seen merely because `selectedTag` was set programmatically.
    const isChatVisible = mobileMode === "conversation" || (typeof window !== "undefined" && window.innerWidth >= 1024);
    if (isChatVisible) {
      markMessagesSeen(selectedTag);
    }
  }, [selectedTag, socket, userTag, messages, mobileMode]);

  const currentContact = filteredContacts.find((contact) => contact.tag === selectedTag) || null;
  const lastSeenText = currentContact?.isOnline ? "Active now" : "Last seen recently";
  const conversationMessages = useMemo(
    () =>
      messages
        .filter(
          (msg) =>
            currentContact &&
            ((msg.senderTag === currentContact.tag && msg.receiverTag === userTag) ||
              (msg.senderTag === userTag && msg.receiverTag === currentContact.tag))
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages, currentContact, userTag]
  );

  const groupedConversationMessages = useMemo(
    () => groupMessagesByDate(conversationMessages),
    [conversationMessages]
  );

  const selectContact = (tag) => {
    setSelectedTag(tag);
    setActiveView("chats");
    setContactsSubView("list");
    setMobileMode("conversation");
    const existing = messages
      .filter((msg) => msg.senderTag === tag && msg.receiverTag === userTag)
      .map((msg) => msg.createdAt);
    if (existing.length > 0) {
      updateLastRead(tag, existing[existing.length - 1]);
    } else {
      updateLastRead(tag, new Date().toISOString());
    }
    markMessagesSeen(tag);
  };

  const sendMessage = () => {
    if (!input.trim() || !currentContact || !userTag || !socket) return;
    const clientId = createClientId();
    const messageData = {
      senderTag: userTag,
      receiverTag: currentContact.tag,
      content: input.trim(),
      clientId,
    };

    socket.emit("sendMessage", messageData);
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        createdAt: new Date().toISOString(),
        status: "sent",
      },
    ]);
    setInput("");
    updateLastRead(currentContact.tag, new Date().toISOString());
  };

  const changeBlockStatus = async (tag, shouldBlock) => {
    try {
      const endpoint = shouldBlock ? "/auth/block" : "/auth/unblock";
      await API.post(`${endpoint}/${encodeURIComponent(tag)}`);
      const me = await API.get("/auth/me");
      updateUser(me.data);
      addNotification(
        shouldBlock ? `Blocked ${tag}` : `You unblocked ${tag}`,
        shouldBlock ? "warning" : "success"
      );
    } catch (err) {
      console.error(shouldBlock ? 'Block failed' : 'Unblock failed', err);
    }
  };

  const deleteChat = async (tag) => {
    try {
      console.debug("deleteChat start", tag);
      await API.post(`/auth/delete-chat/${encodeURIComponent(tag)}`);
      setContacts((prev) => prev.filter((c) => c.tag !== tag));
      setMessages((prev) => prev.filter((m) => m.senderTag !== tag && m.receiverTag !== tag));
      updateUser({ deletedChats: Array.from(new Set([...deletedChatTags, tag])) });
      if (selectedTag === tag) {
        setSelectedTag((prev) => {
          const next = filteredContacts.find((c) => c.tag !== tag);
          return next ? next.tag : null;
        });
      }
      addNotification(`Deleted conversation with ${tag}`, "success");
    } catch (err) {
      console.error('Delete chat failed', err);
      addNotification('Unable to delete chat. Check the browser console for details.', 'warning');
    }
  };

  const showListPanel = mobileMode === "list";
  const showChatPanel = mobileMode === "conversation";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 py-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-3 flex items-center gap-2 rounded-[20px] pl-2 pr-4 py-2">
            <div className="flex items-center gap-2">
              <img src="/splash.png" alt="Pryv logo" className="h-8 w-8 rounded-full object-cover" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-950">Pryv Chat</p>
            </div>
          </div>
          <div className="pointer-events-none fixed inset-x-0 top-24 z-50 mx-auto flex max-w-[1400px] flex-col items-end gap-3 px-4 sm:px-6 lg:px-8">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`w-full max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-lg transition duration-200 ${
                  notification.variant === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : notification.variant === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-slate-50 text-slate-900"
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>

          {incomingRequest && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Connection request</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">You have a new request</h2>
                </div>

                <div className="flex items-start gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-indigo-950 text-white shadow-sm">
                    {incomingRequest.profilePicture ? (
                      <img src={incomingRequest.profilePicture} alt={incomingRequest.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold">{incomingRequest.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-950">{incomingRequest.name || incomingRequest.tag}</p>
                    <p className="mt-1 text-sm text-slate-500">{incomingRequest.tag}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">This user has added you. Accept to connect and start chatting.</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button variant="ghost" size="md" className="w-full sm:w-auto" onClick={handleDeclineRequest}>Decline request</Button>
                  <Button variant="primary" size="md" className="w-full sm:w-auto" onClick={handleAcceptRequest}>Accept request</Button>
                </div>
              </div>
            </div>
          )}

        <div className="relative flex flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl lg:flex-row">
          <div className={`${showListPanel ? "flex" : "hidden lg:flex"} min-h-0 flex-1 flex-col border-b border-slate-200 lg:w-[340px] lg:border-b-0 lg:border-r`}>
            <div className="border-b border-slate-200 px-4 py-4 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{activeView === "contacts" ? "Contacts" : activeView === "profile" ? "Profile" : "Messages"}</p>
                  <h2 className="text-lg font-semibold text-slate-950">{activeView === "contacts" ? "Contacts" : activeView === "profile" ? "Profile" : "Messages"}</h2>
                </div>
                {mobileMode === "conversation" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMode("list")}
                    className="text-slate-700"
                  >
                    Back
                  </Button>
                )}
              </div>
            </div>

            {activeView === "profile" ? (
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6 text-slate-700">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="lg:w-40">
                    <SectionSidebar openSection={openSection} onSelect={setOpenSection} blockedCount={blockedUsers.length} contactsCount={contacts.length} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <ProfilePreview
                      user={user?.user}
                      profilePicture={profilePicture}
                      memberSince={formatDate(user?.user?.createdAt)}
                      contactsCount={contacts.length}
                      verified={user?.user?.verified}
                      discoverable={user?.user?.discoverable}
                      showProfile={user?.user?.showProfile}
                      pendingRequests={pendingReceived.length}
                      blockedCount={blockedUsers.length}
                      onCopyHandle={handleCopyHandle}
                      onUploadClick={triggerProfileUpload}
                    />

                    <ExpandablePanel
                      id="profile"
                      icon="âœï¸"
                      title="Personal info"
                      subtitle="Editable profile details"
                      isOpen={openSection === 'profile'}
                      onToggle={() => setOpenSection((s) => (s === 'profile' ? null : 'profile'))}
                      actions={
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="rounded-full bg-indigo-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {savingProfile ? "Saving..." : "Save"}
                        </button>
                      }
                    >
                      <div className="mt-2 space-y-3">
                        <FormField label="Display name">
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="mt-3 w-full bg-transparent text-sm text-slate-950 outline-none"
                            placeholder="Your display name"
                          />
                        </FormField>
                        <FormField label="Bio / status">
                          <textarea
                            rows="2"
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                            className="mt-3 w-full resize-none bg-transparent text-sm text-slate-950 outline-none"
                            placeholder="Tell people a little about yourself"
                          />
                        </FormField>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField label="Location">
                            <input
                              type="text"
                              value={profileForm.location}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, location: e.target.value }))}
                              className="mt-3 w-full bg-transparent text-sm text-slate-950 outline-none"
                              placeholder="City, country"
                            />
                          </FormField>
                          <FormField label="Pronouns">
                            <input
                              type="text"
                              value={profileForm.pronouns}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, pronouns: e.target.value }))}
                              className="mt-3 w-full bg-transparent text-sm text-slate-950 outline-none"
                              placeholder="She/Her, They/Them"
                            />
                          </FormField>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField label="Website">
                            <input
                              type="url"
                              value={profileForm.website}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
                              className="mt-3 w-full bg-transparent text-sm text-slate-950 outline-none"
                              placeholder="https://your-site.com"
                            />
                          </FormField>
                          <FormField label="Social">
                            <input
                              type="text"
                              value={profileForm.twitter}
                              onChange={(e) => setProfileForm((prev) => ({ ...prev, twitter: e.target.value }))}
                              className="mt-3 w-full bg-transparent text-sm text-slate-950 outline-none"
                              placeholder="Twitter / socials"
                            />
                          </FormField>
                        </div>
                      </div>
                    </ExpandablePanel>

                    <ExpandablePanel
                      id="privacy"
                      icon="ðŸ‘ï¸"
                      title="Privacy & presence"
                      subtitle="Visibility controls"
                      isOpen={openSection === 'privacy'}
                      onToggle={() => setOpenSection((s) => (s === 'privacy' ? null : 'privacy'))}
                      actions={
                        <button
                          type="button"
                          onClick={handleSavePrivacy}
                          disabled={savingPrivacy}
                          className="rounded-full bg-indigo-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {savingPrivacy ? "Saving..." : "Save"}
                        </button>
                      }
                    >
                      <div className="mt-2 space-y-3">
                        <ToggleField
                          inputId="chat-show-online-status"
                          title="Show online status"
                          description="Allow contacts to see when you are active."
                          checked={privacyForm.showOnlineStatus}
                          onChange={(e) => setPrivacyForm((prev) => ({ ...prev, showOnlineStatus: e.target.checked }))}
                        />
                        <ToggleField
                          inputId="chat-show-profile"
                          title="Show my profile"
                          description="Control whether your full profile is visible."
                          checked={privacyForm.showProfile}
                          onChange={(e) => setPrivacyForm((prev) => ({ ...prev, showProfile: e.target.checked }))}
                        />
                        <ToggleField
                          inputId="chat-discoverable"
                          title="Discoverable"
                          description="Allow search and discovery for your account."
                          checked={privacyForm.discoverable}
                          onChange={(e) => setPrivacyForm((prev) => ({ ...prev, discoverable: e.target.checked }))}
                        />
                      </div>
                    </ExpandablePanel>

                    <ExpandablePanel
                      id="security"
                      icon="ðŸ”’"
                      title="Account"
                      subtitle="Security settings"
                      isOpen={openSection === 'security'}
                      onToggle={() => setOpenSection((s) => (s === 'security' ? null : 'security'))}
                      actions={
                        <button
                          type="button"
                          onClick={handleSaveAccount}
                          disabled={savingAccount}
                          className="rounded-full bg-indigo-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {savingAccount ? "Saving..." : "Save"}
                        </button>
                      }
                    >
                      <div className="mt-2 space-y-3">
                        <FormField label="Email">
                          <input
                            type="email"
                            value={accountForm.email}
                            onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="mt-3 w-full bg-transparent text-sm text-slate-950 outline-none"
                            placeholder="you@example.com"
                          />
                        </FormField>
                        <FormField label="Phone">
                          <input
                            type="tel"
                            value={accountForm.phone}
                            onChange={(e) => setAccountForm((prev) => ({ ...prev, phone: e.target.value }))}
                            className="mt-3 w-full bg-transparent text-sm text-slate-950 outline-none"
                            placeholder="Phone number"
                          />
                        </FormField>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-950">OTP settings</p>
                              <p className="mt-1 text-sm text-slate-500">Enable one-time password support when available.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOtpEnabled((prev) => !prev)}
                              className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-100"
                            >
                              {otpEnabled ? "Enabled" : "Enable"}
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleLogoutOtherSessions}
                          className="w-full rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                        >
                          Logout other devices
                        </button>
                      </div>
                    </ExpandablePanel>

                    <ExpandablePanel
                      id="blocked"
                      icon="ðŸš«"
                      title="Blocked users"
                      subtitle="Manage blocklist"
                      isOpen={openSection === 'blocked'}
                      onToggle={() => setOpenSection((s) => (s === 'blocked' ? null : 'blocked'))}
                    >
                      <div className="mt-2 space-y-3">
                        {blockedUsers.length > 0 ? (
                          blockedUsers.map((blocked) => (
                            <div key={blocked.tag} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 overflow-hidden rounded-3xl bg-indigo-950 text-lg font-semibold text-white">
                                  {blocked.profilePicture ? (
                                    <img src={blocked.profilePicture} alt={blocked.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">{blocked.name?.charAt(0)?.toUpperCase() || "U"}</div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-950">{blocked.name}</p>
                                  <p className="text-sm text-slate-500">{blocked.tag}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUnblock(blocked.tag)}
                                disabled={unblocking}
                                className="w-full rounded-full bg-indigo-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                              >
                                Unblock
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            You have not blocked anyone yet.
                          </div>
                        )}
                      </div>
                    </ExpandablePanel>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleProfileFileChange}
                    />
                    {profileError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {profileError}
                      </div>
                    )}
                    {successMessage && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {successMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeView === "contacts" ? (
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  {["list", "discover"].map((mode) => (
                    <Button
                      key={mode}
                      variant={contactsSubView === mode ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setContactsSubView(mode)}
                      className="w-full sm:flex-1"
                    >
                      {mode === "list" ? "My Contacts" : "Discover"}
                    </Button>
                  ))}
                </div>
                {contactsSubView === "discover" ? (
                  <UserDiscovery
                    onStartChat={openConversation}
                    onContactAdded={handleContactAdded}
                    currentUserTag={userTag}
                    existingContacts={contacts.map((contact) => contact.tag)}
                    deletedChatTags={deletedChatTags}
                    pendingSent={pendingSent}
                  />
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Pending requests</p>
                      <div className="mt-3 space-y-2">
                        {pendingReceived.length === 0 ? (
                          <div className="text-sm text-slate-500">No pending requests.</div>
                        ) : (
                          pendingReceived.map((req) => (
                            <div key={req.tag} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-full bg-indigo-950 text-white flex items-center justify-center font-bold">
                                  {req.profilePicture ? (
                                    <img src={req.profilePicture} alt={req.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <span>{req.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{req.name || req.tag}</p>
                                  <p className="text-xs text-slate-500">{req.tag}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  disabled={processingTag === req.tag}
                                  className="w-full sm:w-auto"
                                  onClick={async () => {
                                    const res = await respondToRequest(req.tag, 'decline');
                                    if (res) {
                                      addNotification('You declined the request.', 'info');
                                    }
                                  }}
                                >
                                  {processingTag === req.tag ? 'Processing...' : 'Decline'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="primary" 
                                  disabled={processingTag === req.tag}
                                  className="w-full sm:w-auto"
                                  onClick={async () => {
                                    const res = await respondToRequest(req.tag, 'accept');
                                    if (res) {
                                      addNotification('Request accepted! You are now connected.', 'success');
                                    }
                                  }}
                                >
                                  {processingTag === req.tag ? 'Processing...' : 'Accept'}
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <ContactsList
                      title="My Contacts"
                      contacts={filteredContacts}
                      selectedTag={selectedTag}
                      onSelect={selectContact}
                      searchValue={search}
                      onSearchChange={setSearch}
                    />
                  </div>
                )}
              </div>
            ) : (
              <ContactsList
                title="Chats"
                contacts={filteredContacts}
                selectedTag={selectedTag}
                onSelect={selectContact}
                searchValue={search}
                onSearchChange={setSearch}
              />
            )}
          </div>

          <div className={`${showChatPanel ? "flex" : "hidden lg:flex"} min-h-0 flex-1 flex-col`}>
            <ChatHeader
              contact={currentContact}
              lastSeenText={lastSeenText}
              typingText={currentContact && typingUser?.tag === currentContact.tag ? typingUser.label : null}
              onBlock={(tag) => changeBlockStatus(tag, true)}
              onUnblock={(tag) => changeBlockStatus(tag, false)}
              onDelete={deleteChat}
            />

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {currentContact ? (
                conversationMessages.length === 0 ? (
                  <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    <p className="text-lg font-semibold text-slate-900">No messages yet</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Select a contact or discover someone new to send your first secure conversation.
                    </p>
                    <div className="mt-5 flex justify-center">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setActiveView("contacts");
                          setContactsSubView("discover");
                          setMobileMode("list");
                        }}
                      >
                        Find a contact
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedConversationMessages).map(([dateKey, msgs]) => (
                      <div key={dateKey} className="space-y-5">
                        <div className="sticky top-0 z-0 mx-auto w-fit rounded-full bg-slate-100 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500 shadow-sm">
                          {getFriendlyDateLabel(dateKey)}
                        </div>
                        <div className="space-y-4">
                          {msgs.map((msg, index) => {
                            const isSender = msg.senderTag === userTag;
                            return <MessageBubble key={`${msg.createdAt}-${index}`} message={msg} isSender={isSender} />;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    <p className="text-lg font-semibold text-slate-900">No conversation selected</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Choose a contact to start a secure chat, or search your contacts to begin.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {currentContact && (
              <div className="border-t border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-sm">
                <div className="flex flex-col gap-3 rounded-[32px] border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                  <Button
                    onClick={sendMessage}
                    variant="primary"
                    size="lg"
                    disabled={!input.trim()}
                    className="w-full sm:w-auto"
                  >
                    Send
                  </Button>
                </div>
                <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:justify-between">
                  <span>Encryption is active â€” only your contacts can read this chat.</span>
                  <span>{currentContact.isOnline ? "Online now" : lastSeenText}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-20 block border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-10px_30px_-24px_rgba(15,23,42,0.2)] lg:hidden">
        <div className="mx-auto flex max-w-[700px] items-center justify-start gap-2 overflow-x-auto">
          {[
            { id: "chats", label: "Chats", icon: "chat" },
            { id: "contacts", label: "Contacts", icon: "contacts" },
            { id: "profile", label: "Profile", icon: "profile" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeView === tab.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveView(tab.id);
                setMobileMode("list");
              }}
              className="flex-1 min-w-0"
            >
              <div className="flex min-w-0 items-center justify-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-sm">
                  {tab.icon === "chat" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : tab.icon === "contacts" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 truncate text-xs font-semibold">{tab.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </nav>
    </div>

      
  );
}

